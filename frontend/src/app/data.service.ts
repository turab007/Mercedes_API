import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Vehicle } from './vehicles/vehicles.component';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`
  })
};

@Injectable({
  providedIn: 'root'
})

export class DataService {


  constructor(private http: HttpClient) { }



  login(username: string, password: string) {
    return this.http.post('http://localhost:3000/login', { user_id: username, password: password })

  }

  getVehicleData() {
    return this.http.get('http://localhost:3000/vehicle/index', httpOptions)

  }

  deleteVehicle(id: string) {
    return this.http.delete(`http://localhost:3000/vehicle/delete/${id}`, httpOptions)
  }

  updatevehicle(vehicle: Vehicle) {
    return this.http.put(`http://localhost:3000/vehicle/update/${vehicle._id}`, vehicle, httpOptions)
  }
}
