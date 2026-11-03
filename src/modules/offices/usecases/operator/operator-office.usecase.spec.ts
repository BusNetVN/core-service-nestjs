import { ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CompanyRepository } from '../../../companies/repository/company.repository.js';
import { OfficeRepository } from '../../repository/office.repository.js';
import { OperatorCreateOfficeUseCase } from './operator-create-office.usecase.js';
import { OperatorDeleteOfficeUseCase } from './operator-delete-office.usecase.js';
import { OperatorUpdateOfficeUseCase } from './operator-update-office.usecase.js';

const OWN_COMPANY = {
  id: '3',
  uuid: '8d6f0f2e-3b1a-4c7e-9f00-1a2b3c4d5e6f',
  company_code: 'futa',
  name: 'Phương Trang',
};
const OTHER_COMPANY = {
  id: '9',
  uuid: '1b2c3d4e-5f60-4718-8a9b-0c1d2e3f4a5b',
  company_code: 'khac',
  name: 'Nhà xe khác',
};

function office(company: typeof OWN_COMPANY) {
  return {
    id: '21',
    uuid: 'f0e1d2c3-b4a5-4697-8879-6a5b4c3d2e1f',
    company_id: company.id,
    company,
    office_code: 'VP-HCM',
    name: 'Văn phòng HCM',
    address: '265 Cô Giang',
    phones: ['02838386868'],
    note: '',
    created_by: null,
    updated_by: null,
    created_at: new Date(),
    updated_at: new Date(),
  };
}

describe('Operator office usecases', () => {
  const offices = {
    findByUuid: vi.fn(),
    assertUnique: vi.fn(),
    create: vi.fn((value: unknown) => value),
    save: vi.fn(async (value: unknown) => value),
    merge: vi.fn((target: object, fields: object) =>
      Object.assign(target, fields),
    ),
    remove: vi.fn(),
  };
  const companies = { findByUuid: vi.fn(async () => OWN_COMPANY) };

  let create: OperatorCreateOfficeUseCase;
  let update: OperatorUpdateOfficeUseCase;
  let remove: OperatorDeleteOfficeUseCase;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        OperatorCreateOfficeUseCase,
        OperatorUpdateOfficeUseCase,
        OperatorDeleteOfficeUseCase,
        { provide: OfficeRepository, useValue: offices },
        { provide: CompanyRepository, useValue: companies },
      ],
    }).compile();

    create = module.get(OperatorCreateOfficeUseCase);
    update = module.get(OperatorUpdateOfficeUseCase);
    remove = module.get(OperatorDeleteOfficeUseCase);
  });

  it('creates the office in the company of the token', async () => {
    const created = await create.execute(
      OWN_COMPANY.uuid,
      {
        office_code: 'vp-hcm',
        name: 'Văn phòng HCM',
        address: '265 Cô Giang',
        phones: [' 0283 838 6868 ', '0283 838 6868'],
      },
      'nv01.futa',
    );

    expect(companies.findByUuid).toHaveBeenCalledWith(OWN_COMPANY.uuid);
    expect(offices.assertUnique).toHaveBeenCalledWith(OWN_COMPANY.id, 'VP-HCM');
    expect(created.company_uuid).toBe(OWN_COMPANY.uuid);
    expect(created.office_code).toBe('VP-HCM');
    expect(created.phones).toEqual(['0283 838 6868']);
    expect(created.created_by).toBe('nv01.futa');
  });

  it('updates an office of its own company', async () => {
    offices.findByUuid.mockResolvedValue(office(OWN_COMPANY));

    const updated = await update.execute(
      OWN_COMPANY.uuid,
      'f0e1d2c3-b4a5-4697-8879-6a5b4c3d2e1f',
      { name: 'Văn phòng Sài Gòn' },
      'nv01.futa',
    );

    expect(updated.name).toBe('Văn phòng Sài Gòn');
    expect(updated.updated_by).toBe('nv01.futa');
  });

  it('refuses to update or delete an office of another company', async () => {
    offices.findByUuid.mockResolvedValue(office(OTHER_COMPANY));

    await expect(
      update.execute(
        OWN_COMPANY.uuid,
        'f0e1d2c3-b4a5-4697-8879-6a5b4c3d2e1f',
        {},
        'x',
      ),
    ).rejects.toThrow(ForbiddenException);
    await expect(
      remove.execute(OWN_COMPANY.uuid, 'f0e1d2c3-b4a5-4697-8879-6a5b4c3d2e1f'),
    ).rejects.toThrow(ForbiddenException);
    expect(offices.save).not.toHaveBeenCalled();
    expect(offices.remove).not.toHaveBeenCalled();
  });
});
