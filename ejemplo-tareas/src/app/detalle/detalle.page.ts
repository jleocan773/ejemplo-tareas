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
    let idRecibido = this.activatedRoute.snapshot.paramMap.get('id');
    if (idRecibido != null) {
      this.id = idRecibido;

      this.firestoreService.consultarPorId('tareas', this.id).subscribe((resultado: any) => {
        if (resultado.payload.data() != null) {
          this.document.id = resultado.payload.id;
          this.document.data = resultado.payload.data();
          console.log(this.document.data.titulo);
        } else {
          this.document.data = {} as Tarea;
        }
      });
    } else {
      // Si no se ha pasado un ID es porque estamos en "nuevo"
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
