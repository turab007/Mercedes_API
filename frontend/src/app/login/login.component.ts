import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DataService } from '../data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  username = new FormControl();
  password = new FormControl();

  constructor(private dataService: DataService, private router: Router) { }

  ngOnInit(): void {
  }

  login() {
    this.dataService.login(this.username.value, this.password.value).subscribe(res => {
      console.log("This is the response ", res);
      localStorage.setItem("token", (<any>res).auth_token)
      this.router.navigate(['vehicles'])
    }, err => {
      console.log("This is the error", err)
    })

  }



}
