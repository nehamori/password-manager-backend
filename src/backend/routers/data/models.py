from pydantic import BaseModel, ConfigDict, Field

from database.models import FieldTypeEnum


class DataTypeFieldRequest(BaseModel):
    name: str
    type: FieldTypeEnum


class DataTypeFieldResponse(BaseModel):
    id: int
    name: str
    type: FieldTypeEnum

    model_config = ConfigDict(from_attributes=True)


class DataTypeCreateRequest(BaseModel):
    title: str
    fields: list[DataTypeFieldRequest] = Field(default_factory=list)


class DataTypeUpdateRequest(BaseModel):
    title: str | None = None


class DataTypeResponse(BaseModel):
    id: int
    title: str
    fields: list[DataTypeFieldResponse]

    model_config = ConfigDict(from_attributes=True)


class DataTypeListResponse(BaseModel):
    id: int
    title: str
    field_count: int = Field(serialization_alias="fieldCount")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
