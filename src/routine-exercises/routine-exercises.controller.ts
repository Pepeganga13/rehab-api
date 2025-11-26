import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UsePipes,
    ValidationPipe,
    UseGuards 
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; 
import { CreateRoutineExerciseBatchDto } from './dto/create-routine-exercise-batch.dto';
import { CreateRoutineExerciseDto } from './dto/create-routine-exercise.dto';
import { UpdateRoutineExerciseDto } from './dto/update-routine-exercise.dto';
import { RoutineExercisesService } from './routine-exercises.service';

// Importaciones de seguridad
import { RoleProtected } from '../auth/decorators/role-protected.decorator';
import { UserRoleGuard } from '../auth/guards/user-role.guard';
import { UserRole } from '../auth/roles/user-role.enum';

@Controller('routine-exercises')
@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(AuthGuard('jwt')) 
export class RoutineExercisesController {
    constructor(private readonly routineExercisesService: RoutineExercisesService) {}

    @Post()
    @RoleProtected(UserRole.Professional, UserRole.Admin)
    @UseGuards(UserRoleGuard)
    create(@Body() createRoutineExerciseDto: CreateRoutineExerciseDto) {
        return this.routineExercisesService.create(createRoutineExerciseDto);
    }

    @Post('routine/:routineId/batch')
    @RoleProtected(UserRole.Professional, UserRole.Admin)
    @UseGuards(UserRoleGuard)
    addExercisesToRoutine(
        @Param('routineId', ParseIntPipe) routineId: number,
        @Body() createBatchDto: CreateRoutineExerciseBatchDto
    ) {
        const exercisesWithRoutineId = createBatchDto.exercises.map(exercise => ({
            ...exercise,
            routine_id: routineId,
        }));
        return this.routineExercisesService.addExercisesToRoutine(routineId, exercisesWithRoutineId);
    }

    @Get('routine/:routineId')
    findAllByRoutine(@Param('routineId', ParseIntPipe) routineId: number) {
        return this.routineExercisesService.findAllByRoutine(routineId);
    }


    @Patch(':id')
    @RoleProtected(UserRole.Professional, UserRole.Admin)
    @UseGuards(UserRoleGuard)
    update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateRoutineExerciseDto: UpdateRoutineExerciseDto
    ) {
      return this.routineExercisesService.update(id, updateRoutineExerciseDto);
    }

    @Delete(':id')
    @RoleProtected(UserRole.Professional, UserRole.Admin)
    @UseGuards(UserRoleGuard)
    remove(@Param('id', ParseIntPipe) id: number) {
      return this.routineExercisesService.remove(id);
    }
}