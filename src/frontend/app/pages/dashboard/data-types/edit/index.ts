import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ApiClient } from '../../../../services/api';
import { DataTypeFieldResponse, FieldType } from '../../../../services/models';

type EditableField = DataTypeFieldResponse | { id: 0; name: string; type: FieldType };

@Component({
    selector: 'app-dashboard-data-type-edit',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './index.html',
})
export class DataTypeEditPage implements OnInit {
    typeId = 0;
    title = '';
    fields: EditableField[] = [];
    removedFieldIds: number[] = [];

    isLoading = signal(true);
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
        private readonly route: ActivatedRoute,
        private readonly router: Router,
    ) { }

    ngOnInit(): void {
        void this.initializePage();
    }

    private async initializePage(): Promise<void> {
        const rawId = this.route.snapshot.paramMap.get('id');
        const parsedId = rawId ? Number(rawId) : NaN;

        if (!Number.isFinite(parsedId) || parsedId <= 0) {
            this.errorMessage = 'Invalid data type id';
            this.isLoading.set(false);
            return;
        }

        this.typeId = parsedId;
        await this.loadType();
    }

    async loadType(): Promise<void> {
        this.isLoading.set(true);
        this.errorMessage = '';

        try {
            const dataType = await this.api.getDataType(this.typeId);
            this.title = dataType.title;
            this.fields = dataType.fields;
            this.removedFieldIds = [];
        } catch {
            this.errorMessage = 'Failed to load data type';
        } finally {
            this.isLoading.set(false);
        }
    }

    addField(): void {
        this.fields.push({ id: 0, name: '', type: FieldType.TEXT });
    }

    updateFieldName(index: number, value: string): void {
        const field = this.fields[index];
        if (!field) return;
        field.name = value;
    }

    updateFieldType(index: number, value: FieldType): void {
        const field = this.fields[index];
        if (!field) return;
        field.type = value;
    }

    async saveAll(): Promise<void> {
        const cleanTitle = this.title.trim();
        if (!cleanTitle) {
            this.errorMessage = 'Type name is required';
            return;
        }

        const invalidField = this.fields.find((field) => field.name.trim().length === 0);
        if (invalidField) {
            this.errorMessage = 'Field name is required';
            return;
        }

        this.errorMessage = '';
        this.isSaving = true;

        try {
            await this.api.updateDataType(this.typeId, { title: cleanTitle });

            for (let index = 0; index < this.fields.length; index += 1) {
                const field = this.fields[index];
                const cleanName = field.name.trim();

                if (field.id === 0) {
                    const created = await this.api.addFieldToDataType(this.typeId, {
                        name: cleanName,
                        type: field.type,
                    });
                    this.fields[index] = created;
                    continue;
                }

                await this.api.updateField(this.typeId, field.id, {
                    name: cleanName,
                    type: field.type,
                });
            }

            for (const fieldId of this.removedFieldIds) {
                await this.api.deleteField(this.typeId, fieldId);
            }

            this.removedFieldIds = [];
        } catch {
            this.errorMessage = 'Failed to save changes';
        } finally {
            this.isSaving = false;
        }
    }

    async removeField(index: number): Promise<void> {
        const field = this.fields[index];

        if (field && field.id !== 0) {
            this.removedFieldIds.push(field.id);
        }

        this.fields.splice(index, 1);
    }

    async deleteType(): Promise<void> {
        if (!confirm('Delete this type?')) {
            return;
        }

        try {
            await this.api.deleteDataType(this.typeId);
            await this.router.navigate(['/dashboard/data-types']);
        } catch {
            this.errorMessage = 'Failed to delete type';
        }
    }
}
