import { Component, OnInit } from '@angular/core';
import { CustomBreadcrumb } from '../../shared/breadcrumb/custom-breadcrumb';
import { PageHeader } from '../../shared/page-header/page-header';
import { DividerModule } from 'primeng/divider';
import { CommonModule } from '@angular/common';
import { EntryUserComponent } from "../../components/entry-user/entry-user.component";
import { AuthService } from '../login/service/auth.service';



@Component({
  selector: 'app-entries',
  imports: [CustomBreadcrumb, PageHeader,  CommonModule, DividerModule, EntryUserComponent],
  templateUrl: './entries.html',
  styleUrl: './entries.css'
})
export class Entries implements OnInit{  

  user: string = '';

  constructor(
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const userName = this.authService.getLoggedUser();
    this.user = userName ? userName.username : '';
  }
  
}