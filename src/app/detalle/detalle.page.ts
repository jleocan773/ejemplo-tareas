import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirestoreService } from '../firestore.service';
import { Tarea } from '../tarea';
import { AlertController } from '@ionic/angular';
import {
  NavController,
  LoadingController,
  ToastController,
} from '@ionic/angular';
import { ImagePicker } from '@awesome-cordova-plugins/image-picker/ngx';

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.page.html',
  styleUrls: ['./detalle.page.scss'],
})
export class DetallePage implements OnInit {
  id: string = '';
  //Esta propiedad se utilizará para ocultar o mostrar botones dependiendo de dónde estemoms
  isNuevo: boolean = false;
  //Esta variable es para almacenar el contenido de la imagen
  imagenSelec: string = '';

  document: any = {
    id: '',
    data: {} as Tarea,
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private firestoreService: FirestoreService,
    private navCtrl: NavController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private imagePicker: ImagePicker
  ) {}

  ngOnInit() {
    //Obtener el parámetro "id" de la URL
    let idRecibido = this.activatedRoute.snapshot.paramMap.get('id');
    if (idRecibido != null) {
      //Si hay una id en la URL, asignarlo a la propiedad "idRecibido"
      this.id = idRecibido;

      //Verificar si la id es "nuevo"
      if (this.id.toLowerCase() === 'nuevo') {
        //Si la id es "nuevo", la variable "isNuevo" se establece en verdadera
        this.isNuevo = true;
      } else {
        //Si la id no es "nuevo", realizar una consulta a Firestore para obtener los detalles del documento seleccionado
        this.firestoreService
          .consultarPorId('tareas', this.id)
          .subscribe((resultado: any) => {
            if (resultado.payload.data() != null) {
              //Si se encuentra el documento, asignar la información a la propiedad 'document'
              this.document.id = resultado.payload.id;
              this.document.data = resultado.payload.data();
              console.log(this.document.data.titulo);
            } else {
              //Si no se encuentra el documento, inicializar "document" con una tarea vacía
              this.document.data = {} as Tarea;
            }
          });
      }
    } else {
      //Si no se ha pasado un 'id' en la URL, estamos en el modo "nuevo"
      this.isNuevo = true;
    }
  }

  clicBotonInsertar() {
    this.firestoreService.insertar('tareas', this.document.data).then(
      () => {
        console.log('Tarea insertada correctamente');
        this.navCtrl.navigateBack('/home');
      },
      (error) => {
        console.error(error);
      }
    );
  }

  clicBotonModificar() {
    this.firestoreService
      .modificar('tareas', this.document.id, this.document.data)
      .then(
        () => {
          console.log('Tarea editada correctamente');
          this.navCtrl.navigateBack('/home');
        },
        (error) => {
          console.error(error);
        }
      );
  }

  async clicBotonBorrar() {
    const alert = await this.alertController.create({
      header: 'Confirmar borrado de tarea',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Borrado cancelado');
          },
        },
        {
          text: 'Confirmar',
          role: 'confirm',
          handler: () => {
            //Si se presiona confirmar, manejar el borrado
            this.firestoreService.borrar('tareas', this.document.id).then(
              () => {
                console.log('Tarea borrada correctamente');
                this.navCtrl.navigateBack('/home');
              },
              (error) => {
                console.error(error);
              }
            );
          },
        },
      ],
    });

    await alert.present();
  }

  async seleccionarImagen() {
    //Comprobar si la aplicación tiene permisos de lectura
    this.imagePicker.hasReadPermission().then(
      (result) => {
        //Si no tiene permiso de lectura, se solicita al usuario
        if (result == false) {
          this.imagePicker.requestReadPermission();
        } else {
          // Abrir selector de imágenes (ImagePicker)
          this.imagePicker
            .getPictures({
              maximumImagesCount: 1, // Permitir solo 1 imagen
              outputType: 1, // Imagen en formato base64
            })
            .then(
              (results) => {
                //En esta variable "results" guardaremos la imagen seleccionada
                if (results.length > 0) {
                  //Si se ha seleccionado una imagen
                  //Cargar la imagen en la variable "imagenSelec"
                  this.imagenSelec = 'data:image/jpeg;base64,' + results[0];
                  console.log(
                    'Imagen que se ha seleccionado (en base64): ' +
                      this.imagenSelec
                  );
                }
              },
              (err) => {
                console.log(err);
              }
            );
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  async subirImagen() {
    //Mensaje de espera mientras se suba la imagen
    const loading = await this.loadingController.create({
      message: 'Subiendo imagen...',
    });
    //Mensaje de finalización de subida
    const toast = await this.toastController.create({
      message: 'Imagen subida correctamente',
      duration: 3000,
    });

    //Carpeta donde se guardará la imagen
    let nombreCarpeta = 'imagenes';

    //Mostrar el mensaje de espera
    loading.present();

    //Asignar el nombre de la imagen en función de la hora actual, para evitar duplicados
    let nombreImagen = `${new Date().getTime()}`;
    //Llamar al método que sube la imagen al Storage
    this.firestoreService
      .subirImagenBase64(nombreCarpeta, nombreImagen, this.imagenSelec)
      .then((snapshot) => {
        snapshot.ref.getDownloadURL().then((downloadURL) => {
          //Asignar la URL de descarga de la imagen
          console.log('downloadURL: ' + downloadURL);
          this.document.data.downloadURL = downloadURL;
          //MOstrar el mensaje de finalización de la subida
          toast.present();
          //Ocultar mensaje de espera
          loading.dismiss();
        });
      });
  }

  async eliminarImagen(fileURL: string) {
    const toast = await this.toastController.create({
      message: 'El archivo se ha borrado correctamente',
      duration: 3000,
    });

    //Eliminar la imagen en Firebase Storage
    this.firestoreService.eliminarArchivoPorURL(fileURL).then(
      async () => {
        //Eliminar la downloadURL del documento en Firestore
        this.document.data.downloadURL = null; // Puedes establecerlo en null o eliminar la propiedad, según tus necesidades
        await this.firestoreService.modificar(
          'tareas',
          this.document.id,
          this.document.data
        );

        //Mostrar el mensaje de éxito
        toast.present();
      },
      (err) => {
        console.log(err);
      }
    );
  }
}
