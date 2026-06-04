import { hasFlag } from "country-flag-icons";
import * as FlagIcons from "country-flag-icons/react/3x2";

interface CountryFlagProps {
  countryCode: string | null | undefined;
  countryName: string;
  className?: string;
}

type FlagCode = keyof typeof FlagIcons;

export default function CountryFlag({
  countryCode,
  countryName,
  className,
}: CountryFlagProps) {
  const normalizedCode = countryCode?.trim().toUpperCase();
  const Flag = normalizedCode && hasFlag(normalizedCode)
    ? FlagIcons[normalizedCode as FlagCode]
    : null;

  if (!Flag) {
    return <span className={className}>{countryName}</span>;
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`.trim()}>
      <Flag
        aria-label={`Bandera de ${countryName}`}
        className="h-3.5 w-5 shrink-0 rounded-[1px] object-cover"
        title={countryName}
      />
      <span>{countryName}</span>
    </span>
  );
}
