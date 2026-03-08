import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-login-signin',
  imports: [FormsModule],
  templateUrl: './signin.html',
})
export class SignIn {
  onSubmit(form: any) {
    alert('Username: ' + form.username + '\nPassword: ' + form.password);
  }

  alert = alert;
}
