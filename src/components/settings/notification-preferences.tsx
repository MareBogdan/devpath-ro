"use client";

import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { updateNotificationPreference } from "@/app/(dashboard)/settings/notifications/actions";
import { usePushNotifications } from "@/hooks/use-push-notifications";

interface NotificationPreferencesProps {
  emailWeeklyProgress: boolean;
  emailStreakLost: boolean;
  pushEnabled: boolean;
}

export function NotificationPreferences({
  emailWeeklyProgress,
  emailStreakLost,
  pushEnabled,
}: NotificationPreferencesProps) {
  const { subscribe, unsubscribe } = usePushNotifications();

  const [weekly, setWeekly] = useState(emailWeeklyProgress);
  const [streak, setStreak] = useState(emailStreakLost);
  const [push, setPush] = useState(pushEnabled);
  const [pushSupported, setPushSupported] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("Notification" in window) ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      setPushSupported(false);
    }
  }, []);

  async function handleToggle(
    field: "email_weekly_progress" | "email_streak_lost" | "push_enabled",
    value: boolean,
    setter: (v: boolean) => void
  ) {
    setSaving(field);
    setter(value);

    if (field === "push_enabled") {
      if (value) {
        await subscribe();
      } else {
        await unsubscribe();
      }
    }

    await updateNotificationPreference(field, value);
    setSaving(null);
  }

  return (
    <div className="space-y-6">
      {/* Email section */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-1">
          Notificări email
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Primești emailuri la adresa asociată contului tău.
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="text-sm font-medium text-foreground">
                Email săptămânal de progres
              </p>
              <p className="text-xs text-muted-foreground">
                Un rezumat al activității tale din săptămâna precedentă (luni dimineața)
              </p>
            </div>
            <Switch
              checked={weekly}
              disabled={saving === "email_weekly_progress"}
              onCheckedChange={(v) =>
                handleToggle("email_weekly_progress", v, setWeekly)
              }
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="text-sm font-medium text-foreground">
                Email când pierzi streak-ul
              </p>
              <p className="text-xs text-muted-foreground">
                Te anunțăm dacă nu ai fost activ și streak-ul tău este în pericol
              </p>
            </div>
            <Switch
              checked={streak}
              disabled={saving === "email_streak_lost"}
              onCheckedChange={(v) =>
                handleToggle("email_streak_lost", v, setStreak)
              }
            />
          </div>
        </div>
      </div>

      {/* Push section */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-1">
          Notificări push
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Notificări direct în browser, chiar și când aplicația nu este deschisă.
        </p>

        {!pushSupported ? (
          <p className="text-sm text-muted-foreground bg-muted rounded-lg px-4 py-3">
            Browserul tău nu suportă notificările push. Încearcă Chrome sau Edge.
          </p>
        ) : (
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="text-sm font-medium text-foreground">
                Notificări push în browser
              </p>
              <p className="text-xs text-muted-foreground">
                Activează pentru a primi alerte direct în browser (necesită permisiunea browserului)
              </p>
            </div>
            <Switch
              checked={push}
              disabled={saving === "push_enabled"}
              onCheckedChange={(v) =>
                handleToggle("push_enabled", v, setPush)
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
