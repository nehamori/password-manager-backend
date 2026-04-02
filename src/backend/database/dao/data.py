from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from database.models import DataTypeOrm, DataTypeFieldOrm, FieldTypeEnum


class DataDAO:
    session: AsyncSession

    async def create_data_type(self, user_id: int, title: str) -> DataTypeOrm:
        """Create a new data type for a user."""
        data_type = DataTypeOrm(
            user_id=user_id,
            title=title,
        )
        self.session.add(data_type)
        await self.session.flush([data_type])
        return data_type

    async def get_data_types(self, user_id: int) -> list[DataTypeOrm]:
        """Get all data types for a user."""
        result = await self.session.execute(
            select(DataTypeOrm)
            .where(DataTypeOrm.user_id == user_id)
            .order_by(DataTypeOrm.id)
        )
        return list(result.scalars().all())

    async def get_data_type(
        self, data_type_id: int, user_id: int
    ) -> DataTypeOrm | None:
        """Get a specific data type by ID (with user ownership check)."""
        result = await self.session.execute(
            select(DataTypeOrm).where(
                (DataTypeOrm.id == data_type_id) & (DataTypeOrm.user_id == user_id)
            )
        )
        return result.scalar_one_or_none()

    async def update_data_type_title(
        self, data_type_id: int, user_id: int, title: str
    ) -> DataTypeOrm | None:
        """Update the title of a data type."""
        data_type = await self.get_data_type(data_type_id, user_id)
        if not data_type:
            return None

        data_type.title = title
        await self.session.flush([data_type])
        return data_type

    async def delete_data_type(self, data_type_id: int, user_id: int) -> bool:
        """Delete a data type and all its fields."""
        data_type = await self.get_data_type(data_type_id, user_id)
        if not data_type:
            return False

        # Delete all fields associated with this data type
        await self.session.execute(
            delete(DataTypeFieldOrm).where(
                DataTypeFieldOrm.data_type_id == data_type_id
            )
        )

        # Delete the data type itself
        await self.session.execute(
            delete(DataTypeOrm).where(DataTypeOrm.id == data_type_id)
        )
        return True

    async def add_field_to_data_type(
        self,
        data_type_id: int,
        user_id: int,
        field_name: str,
        field_type: FieldTypeEnum,
    ) -> DataTypeFieldOrm | None:
        """Add a field to a data type."""
        data_type = await self.get_data_type(data_type_id, user_id)
        if not data_type:
            return None

        field = DataTypeFieldOrm(
            data_type_id=data_type_id,
            name=field_name,
            type=field_type,
        )
        self.session.add(field)
        await self.session.flush([field])
        return field

    async def remove_field_from_data_type(
        self, field_id: int, data_type_id: int, user_id: int
    ) -> bool:
        """Remove a field from a data type."""
        data_type = await self.get_data_type(data_type_id, user_id)
        if not data_type:
            return False

        # Verify the field belongs to this data type
        result = await self.session.execute(
            select(DataTypeFieldOrm).where(
                (DataTypeFieldOrm.id == field_id)
                & (DataTypeFieldOrm.data_type_id == data_type_id)
            )
        )
        field = result.scalar_one_or_none()
        if not field:
            return False

        await self.session.delete(field)
        return True

    async def get_field(self, field_id: int) -> DataTypeFieldOrm | None:
        """Get a specific field by ID."""
        result = await self.session.execute(
            select(DataTypeFieldOrm).where(DataTypeFieldOrm.id == field_id)
        )
        return result.scalar_one_or_none()

    async def update_field(
        self,
        field_id: int,
        data_type_id: int,
        user_id: int,
        name: str | None = None,
        field_type: FieldTypeEnum | None = None,
    ) -> DataTypeFieldOrm | None:
        """Update a field's name and/or type."""
        # Verify the data type belongs to the user
        data_type = await self.get_data_type(data_type_id, user_id)
        if not data_type:
            return None

        # Get the field
        result = await self.session.execute(
            select(DataTypeFieldOrm).where(
                (DataTypeFieldOrm.id == field_id)
                & (DataTypeFieldOrm.data_type_id == data_type_id)
            )
        )
        field = result.scalar_one_or_none()
        if not field:
            return None

        # Update fields
        if name is not None:
            field.name = name
        if field_type is not None:
            field.type = field_type

        await self.session.flush([field])
        return field
