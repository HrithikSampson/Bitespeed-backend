import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity("contact")
export class Contact {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  phoneNumber: string;

  @Column({ type: 'text', nullable: true })
  email: string;

  @Column({
    type: 'enum',
    enum: ['primary', 'secondary'],
    enumName: 'linkPrecedenceType',
    nullable: true,
    default: 'primary',
  })
  linkPrecedence: 'primary' | 'secondary';

  @Column({ type: 'int', nullable: true, default: null })
  linkedId: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'NOW()', nullable: false })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'NOW()', nullable: false })
  updatedAt: Date;

  @Column({ type: 'timestamp', default: () => 'NOW()', nullable: true })
  deletedAt: Date;
}