from fastapi import APIRouter, Depends, HTTPException, status

from database import DAO, UserOrm
from routers.depends import get_db_dao, get_user
from database.models import FieldTypeEnum

from .models import (
    DataTypeCreateRequest,
    DataTypeUpdateRequest,
    DataTypeResponse,
    DataTypeListResponse,
    DataTypeFieldRequest,
    DataTypeFieldResponse,
)


data_router = APIRouter(prefix="/data", tags=["data"])


@data_router.post("/types", response_model=DataTypeResponse)
async def create_data_type(
    body: DataTypeCreateRequest,
    user: UserOrm = Depends(get_user),
    dao: DAO = Depends(get_db_dao),
):
    """Create a new data type with fields."""
    data_type = await dao.create_data_type(user.id, body.title)

    # Add fields to the data type
    for field_request in body.fields:
        await dao.add_field_to_data_type(
            data_type.id, user.id, field_request.name, field_request.type
        )

    # Refresh to get the fields
    refreshed = await dao.get_data_type(data_type.id, user.id)
    return refreshed


@data_router.get("/types", response_model=list[DataTypeListResponse])
async def list_data_types(
    user: UserOrm = Depends(get_user),
    dao: DAO = Depends(get_db_dao),
):
    """Get all data types for the current user."""
    data_types = await dao.get_data_types(user.id)

    return [
        DataTypeListResponse(
            id=dt.id,
            title=dt.title,
            field_count=len(dt.fields),
        )
        for dt in data_types
    ]


@data_router.get("/types/{type_id}", response_model=DataTypeResponse)
async def get_data_type(
    type_id: int,
    user: UserOrm = Depends(get_user),
    dao: DAO = Depends(get_db_dao),
):
    """Get a specific data type by ID."""
    data_type = await dao.get_data_type(type_id, user.id)
    if not data_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Data type not found",
        )

    return data_type


@data_router.patch("/types/{type_id}", response_model=DataTypeResponse)
async def update_data_type(
    type_id: int,
    body: DataTypeUpdateRequest,
    user: UserOrm = Depends(get_user),
    dao: DAO = Depends(get_db_dao),
):
    """Update a data type."""
    if body.title is not None:
        data_type = await dao.update_data_type_title(type_id, user.id, body.title)
    else:
        data_type = await dao.get_data_type(type_id, user.id)

    if not data_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Data type not found",
        )

    return data_type


@data_router.delete("/types/{type_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_data_type(
    type_id: int,
    user: UserOrm = Depends(get_user),
    dao: DAO = Depends(get_db_dao),
):
    """Delete a data type and all its fields."""
    success = await dao.delete_data_type(type_id, user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Data type not found",
        )


@data_router.post("/types/{type_id}/fields", response_model=DataTypeFieldResponse)
async def add_field_to_type(
    type_id: int,
    body: DataTypeFieldRequest,
    user: UserOrm = Depends(get_user),
    dao: DAO = Depends(get_db_dao),
):
    """Add a field to a data type."""
    field = await dao.add_field_to_data_type(type_id, user.id, body.name, body.type)

    if not field:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Data type not found",
        )

    return field


@data_router.delete(
    "/types/{type_id}/fields/{field_id}", status_code=status.HTTP_204_NO_CONTENT
)
async def remove_field_from_type(
    type_id: int,
    field_id: int,
    user: UserOrm = Depends(get_user),
    dao: DAO = Depends(get_db_dao),
):
    """Remove a field from a data type."""
    success = await dao.remove_field_from_data_type(field_id, type_id, user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Field not found",
        )


@data_router.patch(
    "/types/{type_id}/fields/{field_id}", response_model=DataTypeFieldResponse
)
async def update_field(
    type_id: int,
    field_id: int,
    body: DataTypeFieldRequest,
    user: UserOrm = Depends(get_user),
    dao: DAO = Depends(get_db_dao),
):
    """Update a field in a data type."""
    field = await dao.update_field(
        field_id, type_id, user.id, name=body.name, field_type=body.type
    )

    if not field:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Field not found",
        )

    return field
