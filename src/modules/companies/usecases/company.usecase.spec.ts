import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CreateCompanyUseCase } from './create-company.usecase.js';
import { FindCompanyUseCase } from './find-company.usecase.js';
import { BusinessType } from '../enums/business-type.enum.js';
import { CompanyRepository } from '../repository/company.repository.js';

const ACTOR_USERNAME = 'admin';

describe('Company usecases', () => {
  const companies = {
    assertUnique: vi.fn(),
    create: vi.fn((value: unknown) => value),
    save: vi.fn(async (value: { uuid?: string }) => ({
      id: '1',
      ...value,
    })),
    findByUuid: vi.fn(),
  };

  let createCompany: CreateCompanyUseCase;
  let findCompany: FindCompanyUseCase;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        CreateCompanyUseCase,
        FindCompanyUseCase,
        {
          provide: CompanyRepository,
          useValue: companies,
        },
      ],
    }).compile();

    createCompany = module.get(CreateCompanyUseCase);
    findCompany = module.get(FindCompanyUseCase);
  });

  it('creates a company when code and slug are unique', async () => {
    companies.assertUnique.mockResolvedValue(undefined);

    const created = await createCompany.execute(
      {
        name: 'Nhà xe Kim Liên',
        company_code: 'KLIEN',
        slug: 'kim-lien',
        business_type: BusinessType.Llc,
      },
      ACTOR_USERNAME,
    );

    expect(created.company_code).toBe('klien');
    expect(created.is_active).toBe(true);
    expect(created.created_by).toBe(ACTOR_USERNAME);
    expect(created.updated_by).toBe(ACTOR_USERNAME);
    expect(created.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(companies.save).toHaveBeenCalled();
  });

  it('rejects a duplicated company code', async () => {
    companies.assertUnique.mockRejectedValue(new ConflictException());

    await expect(
      createCompany.execute(
        {
          name: 'Nhà xe khác',
          company_code: 'futa',
          slug: 'nha-xe-khac',
          business_type: BusinessType.Llc,
        },
        ACTOR_USERNAME,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('throws when company does not exist', async () => {
    companies.findByUuid.mockRejectedValue(new NotFoundException());

    await expect(
      findCompany.execute('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
