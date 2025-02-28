import { ObjectId } from 'mongodb';

export interface User {
    _id?: ObjectId;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateUserDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
}

export interface UpdateUserDto {
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
}

export interface LoginDto {
    email: string;
    password: string;
}
