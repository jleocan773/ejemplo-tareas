import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirestoreService } from '../firestore.service';
import { Tarea } from '../tarea';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.page.html',
  styleUrls: ['./detalle.page.scss'],
})
export class DetallePage implements OnInit {
  id: string = '';
  //Esta propiedad se utilizará para ocultar o mostrar botones dependiendo de dónde estemoms
  isNuevo: boolean = false;

  document: any = {
    id: '',
    data: {} as Tarea,
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private firestoreService: FirestoreService,
    private navCtrl: NavController
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
        this.firestoreService.consultarPorId('tareas', this.id).subscribe((resultado: any) => {
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
        console.log('Tarea insertada correctamente desde detalle.page.ts!');
        this.navCtrl.navigateBack('/home');
      },
      (error) => {
        console.error(error);
      }
    );
  }

  clicBotonModificar() {
    this.firestoreService.modificar('tareas', this.document.id, this.document.data).then(
      () => {
        console.log('Tarea editada correctamente desde detalle.page.ts!');
        this.navCtrl.navigateBack('/home');
      },
      (error) => {
        console.error(error);
      }
    );
  }

  clicBotonBorrar() {
    this.firestoreService.borrar('tareas', this.document.id).then(
      () => {
        console.log('Tarea borrada correctamente desde detalle.page.ts!');
        this.navCtrl.navigateBack('/home');
      },
      (error) => {
        console.error(error);
      }
    );
  }
}
