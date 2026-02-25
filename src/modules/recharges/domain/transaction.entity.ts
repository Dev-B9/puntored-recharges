import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'transactions' })
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'integer' })
  amount!: number;

  @Column({ type: 'varchar', length: 20 })
  phoneNumber!: string;

  @Column({ type: 'varchar', length: 100 })
  userId!: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;
}

