// src/types.ts

// 1 = Paciente, 2 = Médico
export type UserRole = 1 | 2;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface UserSlim {
  id?: string;
  name?: string; 
  nome?: string; 
}

export interface AuthResponse {
  token: string;
  user: User;
}

/**
 * Modelo flexível para atender respostas diferentes da API.
 * Campos principais: date, time, description, symptoms.
 * Aliases opcionais (ex.: ASP.NET/pt-BR): data, hora, descricao, Symptoms, dataHora etc.
 */
export interface Appointment {
  id?: string;
  date?: string;        // ISO (YYYY-MM-DD)
  time?: string;        // HH:mm
  description?: string;
  symptoms?: string;

  // aliases/variantes comuns vindas da API
  data?: string;
  hora?: string;
  descricao?: string;
  Symptoms?: string;    // ASP.NET valida 'Symptoms' (case sensitive)
  dataHora?: string;    // ISO completo

  // identificação opcional de paciente/médico
  patientId?: string;
  patientName?: string;
  pacienteNome?: string;

  doctorId?: string;
  doctorName?: string;
  medicoNome?: string;
}

// helpers/lótus
export const RoleLabel: Record<UserRole, 'PACIENTE' | 'MEDICO'> = {
  1: 'PACIENTE',
  2: 'MEDICO',
};

export const isPaciente = (r: UserRole) => r === 1;
export const isMedico = (r: UserRole) => r === 2;
