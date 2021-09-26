import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Vehicle } from '../vehicles/vehicles.component'
@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit {

  public vehicleForm: FormGroup;

  constructor(public dialogRef: MatDialogRef<EditComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private fb: FormBuilder) { }
  ngOnInit(): void {

    this.vehicleForm = this.fb.group({
      id: this.data.id,
      _id: this.data._id,
      licenseplate: this.data.licenseplate,
      salesdesignation: this.data.salesdesignation,
      finorvin: this.data.finorvin,
      nickname: this.data.nickname,
      modelyear: this.data.modelyear,
      colorname: this.data.colorname,
      fueltype: this.data.fueltype,
      powerhp: this.data.powerhp,
      powerkw: this.data.powerkw,
      numberofdoors: this.data.numberofdoors,
      numberofseats: this.data.numberofseats
    });
  }

  close() {
    this.dialogRef.close({data:this.vehicleForm.value})
  }


}
