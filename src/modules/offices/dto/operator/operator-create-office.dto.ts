import { OfficeFieldsDto } from '../office-fields.dto.js';

/** The company always comes from the access token (sending company_uuid -> 400). */
export class OperatorCreateOfficeDto extends OfficeFieldsDto {}
