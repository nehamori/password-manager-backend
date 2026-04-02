import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ApiClient } from '../../../../services/api';
import { DataTypeField, FieldType } from '../../../../services/models';

type DraftField = {
    name: string;
    type: FieldType;
};

@Component({
    selector: 'app-dashboard-data-type-create',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './index.html',
})
export class DataTypeCreatePage {
    title = '';
    fields: DraftField[] = [
        { name: '', type: FieldType.TEXT },
    ];

    isSaving = false;
    errorMessage = '';
    fieldTypes = [
        FieldType.TEXT,
        FieldType.PASSWORD,
        FieldType.EMAIL,
        FieldType.TOTP,
        FieldType.NOTES,
    ];

    constructor(
        private readonly api: ApiClient,
        private readonly router: Router,
    ) { }

    addField(): void {
        this.fields.push({ name: '', type: FieldType.TEXT });
    }

    removeField(index: number): void {
        this.fields.splice(index, 1);
    }

    async createType(): Promise<void> {
        const cleanTitle = this.title.trim();
        if (!cleanTitle) {
            this.errorMessage = 'Type name is required';
            return;
        }

        const normalizedFields: DataTypeField[] = this.fields
            .map((field) => ({
                name: field.name.trim(),
                type: field.type,
            }))
            .filter((field) => field.name.length > 0);

        this.errorMessage = '';
        this.isSaving = true;

        try {
            const created = await this.api.createDataType({
                title: cleanTitle,
                fields: normalizedFields,
            });

            await this.router.navigate(['/dashboard/data-types', created.id, 'edit']);
        } catch {
            this.errorMessage = 'Failed to create data type';
        } finally {
            this.isSaving = false;
        }
    }
}
