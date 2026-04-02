import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiClient } from '../../../services/api';
import {
    DataTypeListResponse,
} from '../../../services/models';

@Component({
    selector: 'app-dashboard-data-types',
    templateUrl: './index.html',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
})
export class DataTypesPage implements OnInit {
    dataTypes: DataTypeListResponse[] = [];
    filteredDataTypesList: DataTypeListResponse[] = [];
    isLoading = false;
    searchQuery = '';

    constructor(
        private apiClient: ApiClient,
        private cdr: ChangeDetectorRef,
    ) { }

    ngOnInit() {
        void this.loadDataTypes();
    }

    async loadDataTypes() {
        this.isLoading = true;
        try {
            this.dataTypes = await this.apiClient.getDataTypes();
            this.updateFilteredDataTypes();
        } catch (error) {
            console.error('Failed to load data types:', error);
        } finally {
            this.isLoading = false;
            this.cdr.detectChanges();
        }
    }

    async deleteType(typeId: number) {
        if (!confirm('Are you sure you want to delete this data type?')) return;

        try {
            await this.apiClient.deleteDataType(typeId);
            await this.loadDataTypes();
        } catch (error) {
            console.error('Failed to delete data type:', error);
            this.cdr.detectChanges();
        }
    }

    onSearchChange(query: string) {
        this.searchQuery = query;
        this.updateFilteredDataTypes();
    }

    private updateFilteredDataTypes() {
        const normalizedQuery = this.searchQuery.toLowerCase();
        this.filteredDataTypesList = this.dataTypes.filter(type =>
            type.title.toLowerCase().includes(normalizedQuery)
        );
    }
}
