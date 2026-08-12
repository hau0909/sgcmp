"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Search, 
  MapPin, 
  ChevronDown, 
  SlidersHorizontal,
  Navigation,
  X
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Service, City, Ward } from "../types";
import { requestGetCompanyFilters } from "../api/company.api";
import { requestGetWards } from "@/features/address";
import { useTranslation } from "@/components/providers/LanguageProvider";



function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .trim();
}

function cleanName(name: string): string {
  let normalized = normalizeText(name);
  // remove prefixes like "thanh pho", "tinh", "quan", "huyen", "phuong", "xa", "thi tran", "thi xa"
  normalized = normalized
    .replace(/^(thanh pho|tinh|quan|huyen|phuong|xa|thi tran|thi xa)\s+/i, "")
    .trim();
  return normalized;
}

function matchCity(rawCity: string, cities: City[]): City | null {
  const normRaw = normalizeText(rawCity);
  const cleanRaw = cleanName(rawCity);

  if (!normRaw) return null;

  // 1. Exact match normalized
  let found = cities.find(c => normalizeText(c.city_name) === normRaw);
  if (found) return found;

  // 2. Exact match clean
  found = cities.find(c => cleanName(c.city_name) === cleanRaw);
  if (found) return found;

  // 3. Normalized inclusion
  found = cities.find(c => {
    const normCity = normalizeText(c.city_name);
    return normCity.includes(normRaw) || normRaw.includes(normCity);
  });
  if (found) return found;

  // 4. Cleaned inclusion
  found = cities.find(c => {
    const cleanCity = cleanName(c.city_name);
    return cleanCity.includes(cleanRaw) || cleanRaw.includes(cleanCity);
  });
  return found || null;
}

function matchWard(rawWard: string, wardsList: Ward[]): Ward | null {
  const normRaw = normalizeText(rawWard);
  const cleanRaw = cleanName(rawWard);

  if (!normRaw) return null;

  // 1. Exact match normalized
  let found = wardsList.find(w => normalizeText(w.ward_name) === normRaw);
  if (found) return found;

  // 2. Exact match clean
  found = wardsList.find(w => cleanName(w.ward_name) === cleanRaw);
  if (found) return found;

  // 3. Normalized inclusion
  found = wardsList.find(w => {
    const normW = normalizeText(w.ward_name);
    return normW.includes(normRaw) || normRaw.includes(normW);
  });
  if (found) return found;

  // 4. Cleaned inclusion
  found = wardsList.find(w => {
    const cleanW = cleanName(w.ward_name);
    return cleanW.includes(cleanRaw) || cleanRaw.includes(cleanW);
  });
  return found || null;
}


// ── Custom Dual-Thumb Range Slider ────────────────────────────────────────────
function DualRangeSlider({
  min, max, step, minVal, maxVal, onChange,
}: {
  min: number; max: number; step: number;
  minVal: number; maxVal: number;
  onChange: (newMin: number, newMax: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const toPercent = (v: number) => ((v - min) / (max - min)) * 100;

  const getValFromClientX = (clientX: number): number => {
    if (!trackRef.current) return min;
    const { left, width } = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - left) / width));
    const raw = min + pct * (max - min);
    return Math.round(raw / step) * step;
  };

  const startDrag = (
    e: React.MouseEvent | React.TouchEvent,
    thumb: "min" | "max"
  ) => {
    e.preventDefault();
    const onMove = (ev: MouseEvent | TouchEvent) => {
      const clientX = "touches" in ev ? ev.touches[0].clientX : ev.clientX;
      const v = getValFromClientX(clientX);
      if (thumb === "min") onChange(Math.min(v, maxVal - step), maxVal);
      else onChange(minVal, Math.max(v, minVal + step));
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
  };

  const minPct = toPercent(minVal);
  const maxPct = toPercent(maxVal);
  const PRIMARY = "var(--color-primary, #024594)";

  return (
    <div ref={trackRef} className="relative h-6 flex items-center select-none mx-1">
      {/* Track background */}
      <div className="absolute inset-x-0 h-1.5 bg-slate-200 rounded-full" />
      {/* Active range highlight */}
      <div
        className="absolute h-1.5 rounded-full"
        style={{ background: PRIMARY, left: `${minPct}%`, right: `${100 - maxPct}%` }}
      />
      {/* Min thumb */}
      <div
        onMouseDown={(e) => startDrag(e, "min")}
        onTouchStart={(e) => startDrag(e, "min")}
        className="absolute w-4.5 h-4.5 rounded-full border-2 border-white shadow-md cursor-grab active:cursor-grabbing"
        style={{
          background: PRIMARY,
          left: `${minPct}%`,
          transform: "translateX(-50%)",
          zIndex: 3,
          touchAction: "none",
        }}
      />
      {/* Max thumb */}
      <div
        onMouseDown={(e) => startDrag(e, "max")}
        onTouchStart={(e) => startDrag(e, "max")}
        className="absolute w-4.5 h-4.5 rounded-full border-2 border-white shadow-md cursor-grab active:cursor-grabbing"
        style={{
          background: PRIMARY,
          left: `${maxPct}%`,
          transform: "translateX(-50%)",
          zIndex: 4,
          touchAction: "none",
        }}
      />
    </div>
  );
}

interface CompanySearchBarProps {
  variant?: "large" | "mini";
}


export default function CompanySearchBar({ variant = "large" }: CompanySearchBarProps) {
  const { dict, locale } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL State values
  const urlLocation = searchParams.get("location") || "";
  const urlService = searchParams.get("service") || "";
  const urlMinPrice = searchParams.get("minPrice") ? parseInt(searchParams.get("minPrice")!, 10) : undefined;
  const urlMaxPrice = searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!, 10) : undefined;

  // Local state
  const [cityInput, setCityInput] = useState("");
  const [wardInput, setWardInput] = useState("");
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [availableCities, setAvailableCities] = useState<City[]>([]);
  
  // Wards hierarchy state
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);

  // Dropdown states
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [wardDropdownOpen, setWardDropdownOpen] = useState(false);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  const [isLocating, setIsLocating] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);

  // Unified Filter States
  const [selectedServices, setSelectedServices] = useState<string[]>(urlService ? urlService.split(",") : []);
  const [minPriceInput, setMinPriceInput] = useState<number | undefined>(urlMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState<number | undefined>(urlMaxPrice);

  const cityRef = useRef<HTMLDivElement>(null);
  const wardRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const isAnyDropdownOpen = cityDropdownOpen || wardDropdownOpen || filterDropdownOpen;

  // Load available filters on mount
  useEffect(() => {
    async function loadFilters() {
      try {
        const filters = await requestGetCompanyFilters();
        setAvailableServices(filters.services || []);
        setAvailableCities(filters.cities || []);
      } catch (error) {
        console.error("Failed to load company filters in search bar:", error);
      }
    }
    loadFilters();
  }, []);

  // Sync state with URL change
  useEffect(() => {
    if (urlLocation) {
      const parts = urlLocation.split(",");
      const wName = parts.length > 1 ? parts[0].trim() : "";
      const cName = parts.length > 1 ? parts[1].trim() : parts[0].trim();

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCityInput(cName);
      const matchedCity = availableCities.find(
        (c) => c.city_name.toLowerCase() === cName.toLowerCase()
      );
      if (matchedCity) {
        setSelectedCity(matchedCity);
        if (wName) {
          setWardInput(wName);
          requestGetWards(matchedCity.city_id).then((res) => {
            if (res?.success && res.wards) {
              setWards(res.wards);
              const matchedWard = res.wards.find(
                (w: Ward) => w.ward_name.toLowerCase() === wName.toLowerCase()
              );
              if (matchedWard) {
                setSelectedWard(matchedWard);
              }
            }
          });
        } else {
          setSelectedWard(null);
          setWardInput("");
        }
      } else {
        setSelectedCity(null);
        setSelectedWard(null);
        setWardInput("");
      }
    } else {
      setCityInput("");
      setSelectedCity(null);
      setSelectedWard(null);
      setWardInput("");
      setWards([]);
    }
    
    setSelectedServices(urlService ? urlService.split(",") : []);
    setMinPriceInput(urlMinPrice);
    setMaxPriceInput(urlMaxPrice);
  }, [urlLocation, urlService, urlMinPrice, urlMaxPrice, availableCities]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) {
        setCityDropdownOpen(false);
      }
      if (wardRef.current && !wardRef.current.contains(event.target as Node)) {
        setWardDropdownOpen(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (
    newLoc = selectedWard && selectedCity ? `${selectedWard.ward_name}, ${selectedCity.city_name}` : selectedCity ? selectedCity.city_name : cityInput,
    newSvcs = selectedServices,
    newMin = minPriceInput,
    newMax = maxPriceInput,
    isGps = false
  ) => {
    const params = new URLSearchParams();
    if (newLoc.trim()) {
      params.set("location", newLoc.trim());
    }
    if (newSvcs.length > 0) {
      params.set("service", newSvcs.join(","));
    }
    if (newMin !== undefined && newMin > 10000) {
      params.set("minPrice", newMin.toString());
    }
    if (newMax !== undefined && newMax < 500000) {
      params.set("maxPrice", newMax.toString());
    }
    if (isGps) {
      params.set("isGps", "true");
    }
    router.push(`/companies?${params.toString()}`);
  };

  const handleCitySelect = async (city: City) => {
    setSelectedCity(city);
    setCityInput(city.city_name);
    setCityDropdownOpen(false);
    setSelectedWard(null);
    setWardInput("");
    setWards([]);
    
    try {
      setIsLoadingWards(true);
      const res = await requestGetWards(city.city_id);
      if (res?.success && res.wards) {
        setWards(res.wards);
      }
    } catch (error) {
      console.error("Failed to load wards for city:", error);
    } finally {
      setIsLoadingWards(false);
    }

    handleSearchSubmit(city.city_name, selectedServices, minPriceInput, maxPriceInput);
    setWardDropdownOpen(true);
  };

  const handleWardSelect = (ward: Ward) => {
    setSelectedWard(ward);
    setWardInput(ward.ward_name);
    setWardDropdownOpen(false);
    const locString = selectedCity ? `${ward.ward_name}, ${selectedCity.city_name}` : ward.ward_name;
    handleSearchSubmit(locString, selectedServices, minPriceInput, maxPriceInput);
  };

  const handleNearbySelect = () => {
    if (!navigator.geolocation) {
      alert(dict.customer.search.bar_alert_no_location_service);
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=vi`
          );
          const data = await res.json();
          if (data && data.address) {
            const addr = data.address;
            const rawCity = addr.city || addr.province || addr.state || addr.municipality || "";
            const rawWard = addr.suburb || addr.quarter || addr.village || addr.commune || addr.town || "";

            const matchedCity = matchCity(rawCity, availableCities);

            if (matchedCity) {
              setSelectedCity(matchedCity);
              setCityInput(matchedCity.city_name);

              setIsLoadingWards(true);
              const wardsRes = await requestGetWards(matchedCity.city_id);
              if (wardsRes?.success && wardsRes.wards) {
                setWards(wardsRes.wards);
                
                const matchedWard = matchWard(rawWard, wardsRes.wards);
                if (matchedWard) {
                  setSelectedWard(matchedWard);
                  setWardInput(matchedWard.ward_name);
                  const searchVal = `${matchedWard.ward_name}, ${matchedCity.city_name}`;
                  handleSearchSubmit(searchVal, selectedServices, minPriceInput, maxPriceInput, true);
                } else {
                  setSelectedWard(null);
                  setWardInput("");
                  handleSearchSubmit(matchedCity.city_name, selectedServices, minPriceInput, maxPriceInput, true);
                }
              } else {
                setSelectedWard(null);
                setWardInput("");
                setWards([]);
                handleSearchSubmit(matchedCity.city_name, selectedServices, minPriceInput, maxPriceInput, true);
              }
              setIsLoadingWards(false);
            } else {
              const fallbackVal = rawCity || "Đà Nẵng";
              setCityInput(fallbackVal);
              setSelectedCity(null);
              setSelectedWard(null);
              setWardInput("");
              setWards([]);
              handleSearchSubmit(fallbackVal, selectedServices, minPriceInput, maxPriceInput, true);
            }
          }
        } catch (error) {
          console.error("Lỗi định vị:", error);
          setCityInput("Đà Nẵng");
          setSelectedCity(null);
          setSelectedWard(null);
          setWardInput("");
          setWards([]);
          handleSearchSubmit("Đà Nẵng", selectedServices, minPriceInput, maxPriceInput, true);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsLocating(false);
        alert(dict.customer.search.bar_alert_cannot_locate);
      }
    );
  };

  const handleApplyFilters = () => {
    setFilterDropdownOpen(false);
    handleSearchSubmit(undefined, selectedServices, minPriceInput, maxPriceInput);
  };

  const handleResetFilters = () => {
    setSelectedServices([]);
    setMinPriceInput(undefined);
    setMaxPriceInput(undefined);
    setFilterDropdownOpen(false);
    handleSearchSubmit(undefined, [], undefined, undefined);
  };

  const getDropdownOptions = () => {
    const options: Array<{
      name: string;
      icon: React.ComponentType<{ className?: string }>;
      iconColor: string;
      bgColor: string;
      isNearby: boolean;
    }> = [];

    options.push({
      name: locale === "vi" ? "Gần bạn (Định vị GPS)" : "Nearby (GPS Location)",
      icon: Navigation,
      iconColor: "text-primary",
      bgColor: "bg-primary/5",
      isNearby: true
    });

    const query = cityInput.trim().toLowerCase();
    const filteredCities = availableCities.filter(c => 
      c.city_name.toLowerCase().includes(query)
    );

    const citiesToDisplay = query ? filteredCities : availableCities;

    citiesToDisplay.forEach(c => {
      options.push({
        name: c.city_name,
        icon: MapPin,
        iconColor: "text-outline",
        bgColor: "bg-transparent",
        isNearby: false
      });
    });

    return options;
  };

  const dropdownOptions = getDropdownOptions();

  if (variant === "mini") {
    return (
      <div
        className={`flex items-center bg-white border rounded-full h-10 w-full max-w-md divide-x divide-outline-variant/30 text-on-surface pr-1.5 transition-all duration-300 ${
          isAnyDropdownOpen
            ? "border-primary ring-4 ring-primary/10 shadow-[0_4px_20px_rgba(59,130,246,0.12)]"
            : "border-outline-variant/40 hover:border-primary/50 hover:ring-4 hover:ring-primary/[0.04] shadow-sm hover:shadow-md"
        }`}
      >
        {/* City Input & Airbnb-style Dropdown */}
        <div ref={cityRef} className="relative flex-1 flex items-center px-3 py-1 rounded-l-full min-w-0">
          <MapPin className="w-3.5 h-3.5 text-outline shrink-0 mr-1.5" />
          <input
            value={cityInput}
            onFocus={() => {
              setCityDropdownOpen(true);
              setWardDropdownOpen(false);
              setFilterDropdownOpen(false);
            }}
            onChange={(e) => {
              setCityInput(e.target.value);
              setCityDropdownOpen(true);
            }}
            placeholder={isLocating ? dict.customer.search.bar_placeholder_locating : dict.customer.search.bar_placeholder_city}
            disabled={isLocating}
            className="w-full text-[11px] bg-transparent outline-none placeholder:text-outline font-medium truncate"
          />
          {(cityInput || selectedCity) && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCityInput("");
                setSelectedCity(null);
                setSelectedWard(null);
                setWards([]);
                setWardInput("");
                handleSearchSubmit("");
              }}
              className="p-1 hover:bg-slate-100 rounded-full transition-colors shrink-0 mr-1"
            >
              <X className="w-3.5 h-3.5 text-outline-variant" />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNearbySelect();
            }}
            title={locale === "vi" ? "Gần bạn" : "Nearby"}
            className="p-1 hover:bg-slate-100 rounded-full transition-colors flex items-center gap-1 shrink-0 ml-1"
            disabled={isLocating}
          >
            <Navigation className="w-3.5 h-3.5 text-primary shrink-0" />
            {isLocating && (
              <span className="w-2.5 h-2.5 border border-primary border-t-transparent rounded-full animate-spin shrink-0" />
            )}
          </button>
          {cityDropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-60 bg-white border border-outline-variant/40 rounded-xl shadow-xl z-50 overflow-hidden py-1 max-h-60 overflow-y-auto">
              <div className="px-3 py-1.5 text-[9px] font-bold text-outline uppercase tracking-wider bg-surface-container-low/50">
                {dict.customer.search.bar_placeholder_city}
              </div>
              {dropdownOptions.map((dest) => {
                const IconComponent = dest.icon;
                return (
                  <button
                    key={dest.name}
                    onClick={() => {
                      if (dest.isNearby) {
                        handleNearbySelect();
                      } else {
                        const matched = availableCities.find(c => c.city_name === dest.name);
                        if (matched) handleCitySelect(matched);
                      }
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-surface-container-low transition-colors flex items-center gap-2 border-b border-outline-variant/10 last:border-b-0 ${
                      dest.isNearby ? "bg-primary/5 text-primary hover:bg-primary/10" : ""
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 shrink-0 ${dest.isNearby ? "text-primary animate-pulse" : "text-outline"}`} />
                    <div className={`text-[11px] font-semibold truncate ${dest.isNearby ? "text-primary" : "text-on-surface"}`}>{dest.name}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Ward Input & Dropdown */}
        <div ref={wardRef} className="relative flex-1 flex items-center px-3 py-1 min-w-0">
          <input
            value={wardInput}
            onFocus={() => {
              setWardDropdownOpen(true);
              setCityDropdownOpen(false);
              setFilterDropdownOpen(false);
            }}
            onChange={(e) => {
              setWardInput(e.target.value);
              setWardDropdownOpen(true);
            }}
            placeholder={dict.customer.search.bar_ward}
            disabled={!selectedCity}
            className="w-full text-[11px] bg-transparent outline-none placeholder:text-outline font-medium truncate"
          />
          {(wardInput || selectedWard) && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setWardInput("");
                setSelectedWard(null);
                handleSearchSubmit(selectedCity ? selectedCity.city_name : "");
              }}
              className="p-1 hover:bg-slate-100 rounded-full transition-colors shrink-0 mr-1"
            >
              <X className="w-3.5 h-3.5 text-outline-variant" />
            </button>
          )}
          {wardDropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-60 bg-white border border-outline-variant/40 rounded-xl shadow-xl z-50 overflow-hidden py-1 max-h-60 overflow-y-auto">
              {!selectedCity ? (
                <div className="flex flex-col items-center justify-center px-4 py-5 gap-2 text-center">
                  <MapPin className="w-5 h-5 text-outline/40" />
                  <p className="text-[11px] text-on-surface-variant font-medium leading-snug">
                    {dict.customer.search.bar_select_city_first}
                  </p>
                </div>
              ) : (
                <>
                  <div className="px-3 py-1.5 text-[9px] font-bold text-outline uppercase tracking-wider bg-surface-container-low/50">
                    {dict.customer.search.bar_ward_in.replace("{city}", selectedCity.city_name)}
                  </div>
                  {isLoadingWards ? (
                    <div className="px-3.5 py-2 text-xs text-on-surface-variant">{dict.customer.search.bar_loading_wards}</div>
                  ) : wards.filter(w => w.ward_name.toLowerCase().includes(wardInput.toLowerCase())).length > 0 ? (
                    wards
                      .filter(w => w.ward_name.toLowerCase().includes(wardInput.toLowerCase()))
                      .map((ward) => (
                        <button
                          key={ward.ward_id}
                          onClick={() => handleWardSelect(ward)}
                          className="w-full text-left px-3.5 py-2 hover:bg-surface-container-low transition-colors text-xs font-medium border-b border-outline-variant/10 last:border-b-0"
                        >
                          {ward.ward_name}
                        </button>
                      ))
                  ) : (
                    <div className="px-3.5 py-2 text-xs text-on-surface-variant">{dict.customer.search.bar_no_wards}</div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Unified Filter Selection */}
        <div ref={filterRef} className="relative flex-1">
          <button
            onClick={() => {
              setFilterDropdownOpen(!filterDropdownOpen);
              setCityDropdownOpen(false);
              setWardDropdownOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-1 text-[11px] font-medium text-left hover:bg-surface-container-low/20 transition-all"
          >
            <span className="truncate flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3 text-outline shrink-0" />
              {selectedServices.length > 0 ? (
                <span className="text-on-surface font-medium">
                  {selectedServices.length <= 2 ? selectedServices.join(", ") : `${selectedServices.slice(0, 2).join(", ")}, ...`}
                </span>
              ) : (
                <span className="text-outline">{dict.customer.search.bar_filter}</span>
              )}
            </span>
            <ChevronDown className="w-3 h-3 text-outline shrink-0 ml-1" />
          </button>
          {filterDropdownOpen && (
            <div className="absolute top-full right-0 mt-1.5 w-64 bg-white border border-outline-variant/40 rounded-xl shadow-lg z-50 p-4 flex flex-col gap-3.5">
              {!selectedCity ? (
                <div className="flex flex-col items-center justify-center py-4 gap-2 text-center">
                  <MapPin className="w-6 h-6 text-outline/50" />
                  <p className="text-[11px] text-on-surface-variant font-medium">
                    {dict.customer.search.bar_select_city_first_filter}
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
                      {dict.customer.search.bar_services_limit}
                    </label>
                    <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
                      {availableServices.filter((s) => s.is_active !== false).map((s) => {
                        const isChecked = selectedServices.includes(s.name);
                        return (
                          <label key={s.service_id} className="flex items-center gap-2 text-xs text-on-surface cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={!isChecked && selectedServices.length >= 3}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  if (selectedServices.length < 3) setSelectedServices([...selectedServices, s.name]);
                                } else {
                                  setSelectedServices(selectedServices.filter((n) => n !== s.name));
                                }
                              }}
                              className="rounded text-primary focus:ring-primary border-outline-variant/60 w-3.5 h-3.5"
                            />
                            <span className="truncate">{s.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 border-t border-outline-variant/30 pt-2.5">
                <button onClick={handleResetFilters} className="px-2.5 py-1 text-[10px] font-semibold text-outline-variant hover:text-primary transition-colors">
                  {dict.customer.search.bar_reset}
                </button>
                <button onClick={handleApplyFilters} className="px-3 py-1 text-[10px] font-bold bg-primary hover:bg-primary/95 text-white rounded transition-colors">
                  {dict.customer.search.bar_apply}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Search Action */}
        <button
          onClick={() => handleSearchSubmit()}
          className="bg-primary hover:bg-primary/95 hover:scale-105 active:scale-95 text-on-primary w-7.5 h-7.5 rounded-full transition-all flex items-center justify-center shrink-0 shadow-sm ml-1"
        >
          <Search className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // Variant: Large (Hero search bar)
  return (
    <div
      className={`flex items-center h-14 bg-white/85 backdrop-blur-xl border border-white/90 rounded-full text-on-surface p-1.5 transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.08)] ${
        isAnyDropdownOpen
          ? "border-primary ring-4 ring-primary/10 shadow-2xl"
          : "hover:border-primary/50 hover:shadow-xl"
      }`}
    >
      {/* City field & Dropdown */}
      <div ref={cityRef} className="relative flex-1 h-full flex items-center gap-2 px-3 border-r border-slate-200/70">
        <MapPin className="w-4.5 h-4.5 text-primary shrink-0" />
        <input
          value={cityInput}
          onFocus={() => {
            setCityDropdownOpen(true);
            setWardDropdownOpen(false);
            setFilterDropdownOpen(false);
          }}
          onChange={(e) => {
            setCityInput(e.target.value);
            setCityDropdownOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const matched = availableCities.find(c => c.city_name.toLowerCase() === cityInput.toLowerCase());
              if (matched) {
                handleCitySelect(matched);
              } else {
                handleSearchSubmit(cityInput, selectedServices, minPriceInput, maxPriceInput);
                setCityDropdownOpen(false);
              }
            }
          }}
          placeholder={isLocating ? dict.customer.search.bar_placeholder_locating_general : dict.customer.search.bar_placeholder_city}
          disabled={isLocating}
          className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400 font-medium text-on-surface"
        />
        {(cityInput || selectedCity) && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCityInput("");
              setSelectedCity(null);
              setSelectedWard(null);
              setWards([]);
              setWardInput("");
              handleSearchSubmit("");
            }}
            className="p-1 hover:bg-slate-100 rounded-full transition-colors shrink-0 mr-1"
          >
            <X className="w-4 h-4 text-outline-variant" />
          </button>
        )}
        {/* GPS Locator button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleNearbySelect();
          }}
          title={locale === "vi" ? "Gần bạn (GPS)" : "Nearby (GPS)"}
          disabled={isLocating}
          className="p-1.5 hover:bg-primary/10 rounded-full transition-colors flex items-center gap-1 shrink-0"
        >
          <Navigation className={`w-4 h-4 text-primary shrink-0 transition-opacity ${isLocating ? "opacity-50" : ""}`} />
          {isLocating && (
            <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
          )}
        </button>
        {cityDropdownOpen && (
          <div className="absolute top-full left-0 mt-2.5 w-80 bg-white border border-outline-variant/50 rounded-2xl shadow-xl z-[9999] overflow-hidden py-1.5 max-h-80 overflow-y-auto">
            <div className="px-4.5 py-2.5 text-xs font-bold text-outline uppercase tracking-wider bg-surface-container-low/50">
              {dict.customer.search.bar_suggested_cities}
            </div>
            {dropdownOptions.map((dest) => {
              const IconComponent = dest.icon;
              return (
                <button
                  key={dest.name}
                  onClick={() => {
                    if (dest.isNearby) {
                      handleNearbySelect();
                    } else {
                      const matched = availableCities.find(c => c.city_name === dest.name);
                      if (matched) handleCitySelect(matched);
                    }
                  }}
                  className={`w-full text-left px-4.5 py-2.5 hover:bg-surface-container-low transition-colors flex items-center gap-3 border-b border-outline-variant/10 last:border-b-0 ${
                    dest.isNearby ? "bg-primary/5 hover:bg-primary/10" : ""
                  }`}
                >
                  <IconComponent className={`w-4.5 h-4.5 shrink-0 ml-1 ${dest.isNearby ? "text-primary animate-pulse" : "text-outline"}`} />
                  <div className={`text-sm font-semibold leading-tight ${dest.isNearby ? "text-primary" : "text-on-surface"}`}>{dest.name}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Ward select field & Dropdown */}
      <div ref={wardRef} className="relative flex-1 h-full flex items-center gap-2 px-3 border-r border-slate-200/70">
        <MapPin className="w-4.5 h-4.5 text-primary shrink-0" />
        <input
          value={wardInput}
          onFocus={() => {
            setWardDropdownOpen(true);
            setCityDropdownOpen(false);
            setFilterDropdownOpen(false);
          }}
          onChange={(e) => {
            setWardInput(e.target.value);
            setWardDropdownOpen(true);
          }}
          placeholder={dict.customer.search.bar_ward}
          disabled={!selectedCity}
          className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400 font-medium text-on-surface"
        />
        {(wardInput || selectedWard) && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setWardInput("");
              setSelectedWard(null);
              handleSearchSubmit(selectedCity ? selectedCity.city_name : "");
            }}
            className="p-1 hover:bg-slate-100 rounded-full transition-colors shrink-0 mr-1"
          >
            <X className="w-4 h-4 text-outline-variant" />
          </button>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 ml-auto transition-transform duration-200 ${wardDropdownOpen ? "rotate-180" : ""}`} />
        
        {wardDropdownOpen && (
          <div className="absolute top-full left-0 mt-2.5 w-80 bg-white border border-outline-variant/50 rounded-2xl shadow-xl z-[9999] overflow-hidden py-1.5 max-h-80 overflow-y-auto">
            {!selectedCity ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3 text-center px-5">
                <div className="w-12 h-12 rounded-full bg-primary/8 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary/50" />
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">{dict.customer.search.bar_no_location_selected}</p>
                  <p className="text-xs text-on-surface-variant mt-1 leading-snug">
                    {dict.customer.search.bar_select_city_first}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="px-4 py-2.5 text-xs font-bold text-outline uppercase tracking-wider bg-surface-container-low/50">
                  {dict.customer.search.bar_ward_in.replace("{city}", selectedCity.city_name)}
                </div>
                {isLoadingWards ? (
                  <div className="px-4 py-4 text-xs text-on-surface-variant">{dict.customer.search.bar_loading_wards}</div>
                ) : wards.filter(w => w.ward_name.toLowerCase().includes(wardInput.toLowerCase())).length > 0 ? (
                  wards
                    .filter(w => w.ward_name.toLowerCase().includes(wardInput.toLowerCase()))
                    .map((ward) => (
                      <button
                        key={ward.ward_id}
                        onClick={() => handleWardSelect(ward)}
                        className={`w-full text-left px-4 py-2.5 hover:bg-surface-container-low transition-colors text-sm font-medium border-b border-outline-variant/10 last:border-b-0 ${
                          selectedWard?.ward_id === ward.ward_id ? "text-primary font-bold bg-primary/5" : "text-on-surface"
                        }`}
                      >
                        {ward.ward_name}
                      </button>
                    ))
                ) : (
                  <div className="px-4 py-4 text-xs text-on-surface-variant">{dict.customer.search.bar_no_wards}</div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Unified Filter selection dropdown */}
      <div ref={filterRef} className="relative flex-1 h-full flex items-center">
        <button
          onClick={() => {
            setFilterDropdownOpen(!filterDropdownOpen);
            setCityDropdownOpen(false);
            setWardDropdownOpen(false);
          }}
          className="w-full h-full flex items-center justify-between px-3 text-sm font-medium text-left bg-transparent transition-colors rounded-r-full"
        >
          <span className="truncate flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-primary shrink-0" />
            {selectedServices.length > 0 ? (
              <span className="text-on-surface font-medium">
                {selectedServices.length <= 2 ? selectedServices.join(", ") : `${selectedServices.slice(0, 2).join(", ")}, ...`}
              </span>
            ) : (
              <span className="text-slate-400">{dict.customer.search.bar_filter}</span>
            )}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
        </button>
        {filterDropdownOpen && (
          <div className="absolute top-full right-0 mt-2.5 w-80 bg-white border border-outline-variant/50 rounded-2xl shadow-2xl z-[9999] p-5 flex flex-col gap-4">
            {!selectedCity ? (
              <div className="flex flex-col items-center justify-center py-6 gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/8 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary/60" />
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">{dict.customer.search.bar_no_location_selected}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {dict.customer.search.bar_select_city_first_filter}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2">
                    {dict.customer.search.bar_services_limit}
                  </label>
                  <div className="flex flex-col gap-2 max-h-44 overflow-y-auto pr-1">
                    {availableServices.filter((s) => s.is_active !== false).map((s) => {
                      const isChecked = selectedServices.includes(s.name);
                      return (
                        <label key={s.service_id} className="flex items-center gap-2.5 text-sm text-on-surface cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={!isChecked && selectedServices.length >= 3}
                            onChange={(e) => {
                              if (e.target.checked) {
                                if (selectedServices.length < 3) setSelectedServices([...selectedServices, s.name]);
                              } else {
                                setSelectedServices(selectedServices.filter((n) => n !== s.name));
                              }
                            }}
                            className="rounded text-primary focus:ring-primary border-outline-variant/60 w-4 h-4"
                          />
                          <span className="truncate">{s.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 border-t border-outline-variant/30 pt-3">
              <button onClick={handleResetFilters} className="px-3.5 py-1.5 text-xs font-bold text-outline-variant hover:text-primary transition-colors">
                {dict.customer.search.bar_reset}
              </button>
              <button onClick={handleApplyFilters} className="px-4.5 py-1.5 text-xs font-bold bg-primary hover:bg-primary/95 text-white rounded-xl transition-colors shadow-sm">
                {dict.customer.search.bar_apply}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Search submit button inside pill */}
      <button
        onClick={() => handleSearchSubmit()}
        className="bg-primary hover:bg-primary/95 hover:scale-105 active:scale-95 text-white w-10 h-10 rounded-full transition-all flex items-center justify-center shrink-0 shadow-md ml-1"
      >
        <Search className="w-4.5 h-4.5" />
      </button>
    </div>
  );
}
