

Script para crear automáticamente turnos (slots) de 30 minutos, para cada quirófano, desde las 08:00 hasta las 18:00, para todos los días de un mes, dejándolos como AVAILABLE.


DO $$
DECLARE
  current_day DATE;
  month_start DATE := DATE '2026-01-01';
  month_end   DATE := DATE '2026-01-31';

  slot_start  TIMESTAMP;
  slot_end    TIMESTAMP;

  q_id        INT;
BEGIN
  current_day := month_start;

  WHILE current_day <= month_end LOOP

    FOREACH q_id IN ARRAY ARRAY[1,2,3] LOOP

      slot_start := current_day + TIME '08:00';
      slot_end   := current_day + TIME '18:00';

      WHILE slot_start < slot_end LOOP
        INSERT INTO "Agenda_slot" (
          "startTime",
          "endTime",
          status,
          "quirofanoId",
          version
        )
        VALUES (
          slot_start,
          slot_start + INTERVAL '30 minutes',
          'AVAILABLE',
          q_id,
          1
        );

        slot_start := slot_start + INTERVAL '30 minutes';
      END LOOP;

    END LOOP;

    current_day := current_day + INTERVAL '1 day';
  END LOOP;
END $$;
