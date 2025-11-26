import { Test, TestingModule } from '@nestjs/testing';
import { RoutineExercisesService } from './routine-exercises.service';

describe('RoutineExercisesService', () => {
  let service: RoutineExercisesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoutineExercisesService],
    }).compile();

    service = module.get<RoutineExercisesService>(RoutineExercisesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
