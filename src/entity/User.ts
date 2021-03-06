import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  BeforeInsert,
} from "typeorm";
import * as bcrypt from "bcryptjs";

@Entity("users")
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("boolean", { default: false })
  confirmed: boolean;

  @Column("varchar", { length: 255 })
  firstName: string;

  @Column("varchar", { length: 255 })
  lastName: string;

  @Column("varchar", { length: 255, unique: true })
  email: string;

  @Column("text") // Passwords will be hashed therefore set type as "text"
  password: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
