import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirestoreService } from '../firestore.service';
import { Tarea } from '../tarea';

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.page.html',
  styleUrls: ['./detalle.page.scss'],
})
export class DetallePage implements OnInit {
  id: string = '';

  document: any = {
    id: '',
    data: {} as Tarea,
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private firestoreService: FirestoreService
  ) {}

  ngOnInit() {
    let idRecibido = this.activatedRoute.snapshot.paramMap.get('id');
    if (idRecibido != null) {
      this.id = idRecibido;
    } else {
      this.id = '';
    }

    //Se hace la consulta a la basae de datos para obtener los datos asociados a esa id
    this.firestoreService
      .consultarPorId('tareas', this.id)
      .subscribe((resultado: any) => {
        if (resultado.payload.data() != null) {
          this.document.id = resultado.payload.id;
          this.document.data = resultado.payload.data();
          //Como ejemplo, mostrar el título de la tarea en consola
          console.log(this.document.data.titulo);
        } else {
          //No se ha encontrado un document con ese ID. Vaciar los datos que hubiera
          this.document.data = {} as Tarea;
        }
      });
  }

  clicBotonModificar() {
    this.firestoreService.modificar("tareas", this.document.id, this.document.data).then(() => {
      console.log('Tarea editada correctamente desde detalle.page.ts!');
    }, (error) => {
      console.error(error);
    });
  }

  clicBotonBorrar() {
    this.firestoreService.borrar("tareas", this.document.id).then(() => {
      console.log('Tarea borrada correctamente desde detalle.page.ts!');
    }, (error) => {
      console.error(error);
    });
  }
}
