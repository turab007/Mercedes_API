import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { EditComponent } from '../edit/edit.component';

@Component({
  selector: 'app-vehicles',
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.css']
})
export class VehiclesComponent implements OnInit {

  displayedColumns = ['licenseplate', 'salesdesignation', 'finorvin', 'nickname', 'modelyear', 'colorname', 'options'];
  dataSource = [];


  constructor(private dataService: DataService, public dialog: MatDialog) { }

  ngOnInit(): void {

    this.dataService.getVehicleData().subscribe(res => {
      this.dataSource = (<any>res).vehicles

    })
  }


  openDialog(vehicle: Vehicle): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '500px',
      // data: {name: this.name, animal: this.animal}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dataService.deleteVehicle(vehicle._id).subscribe(res => {
          this.ngOnInit()
        }, err => {
          console.log("error ", err)
        })
      }
    });
  }

  EditVehicle(vehicle: Vehicle) {
    const dialogRef = this.dialog.open(EditComponent, {
      width: '500px',
      data: vehicle
    });


    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dataService.updatevehicle(result.data).subscribe(res => {
          this.ngOnInit()
        }, err => {

        })
      }
    });
  }

}


export interface Vehicle {
  id: string;
  _id: string;
  licenseplate: string;
  salesdesignation: string;
  finorvin: string;
  nickname: string;
  modelyear: string;
  colorname: string;
  fueltype: string;
  powerhp: string;
  powerkw: string;
  numberofdoors: string;
  numberofseats: string;


}

// const ELEMENT_DATA: PeriodicElement[] = [
//   { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
//   { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
//   { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
//   { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
//   { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
//   { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
//   { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
//   { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
//   { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
//   { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
// ];
