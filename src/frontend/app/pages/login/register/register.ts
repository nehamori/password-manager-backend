import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login-register',
  imports: [FormsModule],
  templateUrl: './register.html',
})
export class Register {
  register(form: any) {
    console.log(form);
  }
}
