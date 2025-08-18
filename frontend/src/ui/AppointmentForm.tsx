'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/lib/api';
import type { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { toast } from 'sonner';

const schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida"),
  symptoms: z.string().min(3, "Descreva os sintomas"),
  description: z.string().optional(),
  doctorId: z.string().min(1, "Selecione um médico"),
});

type FormData = z.infer<typeof schema>;

export function AppointmentForm({ token, onCreated }: { token: string; onCreated?: () => void; }) {
  const [doctors, setDoctors] = useState<User[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { date: "", time: "", symptoms: "", description: "", doctorId: "" },
  });

  useEffect(() => {
    let alive = true;
    setLoadingDoctors(true);
    api.listDoctors(token)
      .then(list => { if (alive) setDoctors(list); })
      .catch(() => {})
      .finally(() => { if (alive) setLoadingDoctors(false); });
    return () => { alive = false; };
  }, [token]);

  const onSubmit = async (data: FormData) => {
    try {
      await api.createAppointment(token, {
        date: data.date,
        time: data.time,
        symptoms: data.symptoms,
        description: data.description || "",
        doctorId: data.doctorId,
      });
      toast.success("Agendamento criado com sucesso!");
      reset();
      onCreated?.();
    } catch (e: any) {
      toast.error(e?.message || "Erro ao criar agendamento");
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} aria-label="Formulário de agendamento">
        <div className="row" style={{marginBottom: 12}}>
          <div>
            <Label htmlFor="date">Data</Label>
            <Input id="date" type="date" aria-label="Data do agendamento" {...register("date")} />
            {errors.date && <p style={{ color: 'salmon', fontSize: 12 }}>{errors.date.message}</p>}
          </div>
          <div>
            <Label htmlFor="time">Hora</Label>
            <Input id="time" type="time" aria-label="Hora do agendamento" {...register("time")} />
            {errors.time && <p style={{ color: 'salmon', fontSize: 12 }}>{errors.time.message}</p>}
          </div>
        </div>

        <div style={{marginBottom: 12}}>
          <Label htmlFor="symptoms">Sintomas</Label>
          <Input id="symptoms" placeholder="Descreva os sintomas" aria-label="Sintomas" {...register("symptoms")} />
          {errors.symptoms && <p style={{ color: 'salmon', fontSize: 12 }}>{errors.symptoms.message}</p>}
        </div>

        <div style={{marginBottom: 12}}>
          <Label htmlFor="description">Descrição (opcional)</Label>
          <Input id="description" placeholder="Detalhes adicionais" aria-label="Descrição do agendamento" {...register("description")} />
        </div>

        <div style={{marginBottom: 16}}>
          <Label htmlFor="doctorId">Médico</Label>
          <Select id="doctorId" aria-label="Médico" disabled={loadingDoctors} {...register("doctorId")}>
            <option value="">{loadingDoctors ? "Carregando..." : "Selecione um médico"}</option>
            {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Select>
          {errors.doctorId && <p style={{ color: 'salmon', fontSize: 12 }}>{errors.doctorId.message}</p>}
        </div>

        <Button type="submit" disabled={isSubmitting || loadingDoctors} aria-label="Criar agendamento">
          {isSubmitting ? "Criando..." : "Criar agendamento"}
        </Button>
      </form>
    </Card>
  );
}
