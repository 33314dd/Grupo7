import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService } from '@/services/eventService';
import { useEventStore } from '@/store/eventStore';
import { toast } from '@/components/ui/use-toast';

export const useEvents = (filters = {}) => {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: () => eventService.getEvents(filters),
    onSuccess: (data) => {
      useEventStore.getState().setEvents(data);
    },
  });
};

export const useEvent = (id) => {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => eventService.getEventById(id),
    enabled: !!id,
    onSuccess: (data) => {
      useEventStore.getState().setSelectedEvent(data);
    },
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: eventService.createEvent,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['events']);
      useEventStore.getState().addEvent(data);
      toast({
        title: '¡Evento creado!',
        description: 'Tu evento ha sido creado exitosamente.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'No se pudo crear el evento. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }) => eventService.updateEvent(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['events']);
      queryClient.invalidateQueries(['event', data.id]);
      useEventStore.getState().updateEvent(data.id, data);
      toast({
        title: '¡Evento actualizado!',
        description: 'Los cambios han sido guardados.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el evento.',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: eventService.deleteEvent,
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries(['events']);
      useEventStore.getState().removeEvent(eventId);
      toast({
        title: 'Evento eliminado',
        description: 'El evento ha sido eliminado exitosamente.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el evento.',
        variant: 'destructive',
      });
    },
  });
};

export const useJoinEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: eventService.joinEvent,
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
      toast({
        title: '¡Te has unido al evento!',
        description: 'Recibirás notificaciones sobre este evento.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'No se pudo unir al evento.',
        variant: 'destructive',
      });
    },
  });
};