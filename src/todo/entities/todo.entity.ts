import { date } from 'joi';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('todos')
export class Todo {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('text', { unique: true , nullable: false})
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('boolean', { default: false })
  completed: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn() // Agrega esta línea para soportar soft delete
  deletedAt?: Date;
}
