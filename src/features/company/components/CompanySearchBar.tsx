"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Search, 
  MapPin, 
  ChevronDown, 
  SlidersHorizontal,
  Navigation
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Service, City, Ward } from "../types";
import { requestGetCompanyFilters } from "../api/company.api";
import { requestGetWards } from "@/features/address";



function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .trim();
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
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL State values
  const urlLocation = searchParams.get("location") || "";
  const urlService = searchParams.get("service") || "";
  const urlMinPrice = searchParams.get("minPrice") ? parseInt(searchParams.get("minPrice")!, 10) : undefined;
  const urlMaxPrice = searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!, 10) : undefined;

  // Local state
  const [cityInput, setCityInput] = useState("");
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
        }
      } else {
        setSelectedCity(null);
        setSelectedWard(null);
      }
    } else {
      setCityInput("");
      setSelectedCity(null);
      setSelectedWard(null);
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
    newMax = maxPriceInput
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
    router.push(`/companies?${params.toString()}`);
  };

  const handleCitySelect = async (city: City) => {
    setSelectedCity(city);
    setCityInput(city.city_name);
    setCityDropdownOpen(false);
    setSelectedWard(null);
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
    setWardDropdownOpen(false);
    const locString = selectedCity ? `${ward.ward_name}, ${selectedCity.city_name}` : ward.ward_name;
    handleSearchSubmit(locString, selectedServices, minPriceInput, maxPriceInput);
  };

  const handleNearbySelect = () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt của bạn không hỗ trợ định vị vị trí.");
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
            const city = data.address.city || data.address.state || data.address.town || data.address.quarter || "";
            const cleanedCity = city
              .replace("Thành phố ", "")
              .replace("Tỉnh ", "")
              .trim();
            
            if (cleanedCity) {
              const matched = availableCities.find(
                (c) => normalizeText(c.city_name).includes(normalizeText(cleanedCity))
              );
              if (matched) {
                handleCitySelect(matched);
              } else {
                setCityInput(cleanedCity);
                handleSearchSubmit(cleanedCity, selectedServices, minPriceInput, maxPriceInput);
              }
            } else {
              setCityInput("Đà Nẵng");
              handleSearchSubmit("Đà Nẵng", selectedServices, minPriceInput, maxPriceInput);
            }
          }
        } catch (error) {
          console.error("Lỗi định vị:", error);
          setCityInput("Đà Nẵng");
          handleSearchSubmit("Đà Nẵng", selectedServices, minPriceInput, maxPriceInput);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsLocating(false);
        alert("Không thể lấy vị trí hiện tại của bạn. Vui lòng tự nhập hoặc chọn tỉnh thành gợi ý.");
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
            placeholder={isLocating ? "Đang định vị..." : "Tỉnh / Thành phố"}
            disabled={isLocating}
            className="w-full text-[11px] bg-transparent outline-none placeholder:text-outline font-medium truncate"
          />
          {cityDropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-60 bg-white border border-outline-variant/40 rounded-xl shadow-xl z-50 overflow-hidden py-1 max-h-60 overflow-y-auto">
              <div className="px-3 py-1.5 text-[9px] font-bold text-outline uppercase tracking-wider bg-surface-container-low/50">
                Tỉnh / Thành phố
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
                    className="w-full text-left px-3 py-1.5 hover:bg-surface-container-low transition-colors flex items-center gap-2 border-b border-outline-variant/10 last:border-b-0"
                  >
                    <IconComponent className="w-3.5 h-3.5 text-outline shrink-0" />
                    <div className="text-[11px] font-semibold text-on-surface truncate">{dest.name}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Ward Input & Dropdown */}
        <div ref={wardRef} className="relative flex-1 flex items-center px-3 py-1 min-w-0">
          <button
            onClick={() => {
              setWardDropdownOpen(!wardDropdownOpen);
              setCityDropdownOpen(false);
              setFilterDropdownOpen(false);
            }}
            className="w-full text-left text-[11px] font-medium bg-transparent outline-none truncate"
          >
            {selectedWard ? (
              <span className="text-on-surface font-medium">{selectedWard.ward_name}</span>
            ) : (
              <span className="text-outline">Phường / Xã</span>
            )}
          </button>
          {wardDropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-60 bg-white border border-outline-variant/40 rounded-xl shadow-xl z-50 overflow-hidden py-1 max-h-60 overflow-y-auto">
              {!selectedCity ? (
                <div className="flex flex-col items-center justify-center px-4 py-5 gap-2 text-center">
                  <MapPin className="w-5 h-5 text-outline/40" />
                  <p className="text-[11px] text-on-surface-variant font-medium leading-snug">
                    Vui lòng chọn <span className="font-bold text-primary">Tỉnh / Thành phố</span> trước
                  </p>
                </div>
              ) : (
                <>
                  <div className="px-3 py-1.5 text-[9px] font-bold text-outline uppercase tracking-wider bg-surface-container-low/50">
                    Phường / Xã tại {selectedCity.city_name}
                  </div>
                  {isLoadingWards ? (
                    <div className="px-3.5 py-2 text-xs text-on-surface-variant">Đang tải...</div>
                  ) : wards.length > 0 ? (
                    wards.map((ward) => (
                      <button
                        key={ward.ward_id}
                        onClick={() => handleWardSelect(ward)}
                        className="w-full text-left px-3.5 py-2 hover:bg-surface-container-low transition-colors text-xs font-medium border-b border-outline-variant/10 last:border-b-0"
                      >
                        {ward.ward_name}
                      </button>
                    ))
                  ) : (
                    <div className="px-3.5 py-2 text-xs text-on-surface-variant">Không tìm thấy phường/xã</div>
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
                <span className="text-outline">Bộ lọc</span>
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
                    Vui lòng chọn <span className="font-bold text-primary">địa điểm</span> trước khi lọc
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
                      Dịch vụ (Tối đa 3)
                    </label>
                    <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
                      {availableServices.map((s) => {
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

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1.5">
                      Khoảng giá (đ/giờ)
                    </label>
                    <div className="flex justify-between text-[10px] font-bold text-primary mb-2 bg-primary/5 rounded px-2 py-1">
                      <span>{(minPriceInput ?? 10000).toLocaleString("vi-VN")}đ</span>
                      <span>–</span>
                      <span>{maxPriceInput !== undefined && maxPriceInput < 500000 ? `${maxPriceInput.toLocaleString("vi-VN")}đ` : "Không giới hạn"}</span>
                    </div>
                    <DualRangeSlider
                      min={10000} max={500000} step={10000}
                      minVal={minPriceInput ?? 10000}
                      maxVal={maxPriceInput ?? 500000}
                      onChange={(lo, hi) => {
                        setMinPriceInput(lo > 10000 ? lo : undefined);
                        setMaxPriceInput(hi < 500000 ? hi : undefined);
                      }}
                    />
                    <div className="flex justify-between text-[9px] text-outline mt-1 font-medium">
                      <span>10.000đ</span><span>500.000đ+</span>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 border-t border-outline-variant/30 pt-2.5">
                <button onClick={handleResetFilters} className="px-2.5 py-1 text-[10px] font-semibold text-outline-variant hover:text-primary transition-colors">
                  Đặt lại
                </button>
                <button onClick={handleApplyFilters} className="px-3 py-1 text-[10px] font-bold bg-primary hover:bg-primary/95 text-white rounded transition-colors">
                  Áp dụng
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
      className={`flex items-center h-14 bg-white border rounded-full text-on-surface pl-2 pr-2 transition-all duration-300 divide-x divide-outline-variant/30 ${
        isAnyDropdownOpen
          ? "border-primary ring-4 ring-primary/10 shadow-[0_4px_20px_rgba(59,130,246,0.12)]"
          : "border-outline-variant/40 hover:border-primary/50 hover:ring-4 hover:ring-primary/[0.04] shadow-sm hover:shadow-md"
      }`}
    >
      {/* City field & Dropdown */}
      <div ref={cityRef} className="relative flex-1 h-full flex items-center gap-2 px-4 rounded-l-full">
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
          placeholder={isLocating ? "Đang xác định..." : "Tỉnh / Thành phố"}
          disabled={isLocating}
          className="flex-1 text-sm bg-transparent outline-none placeholder:text-outline font-medium text-on-surface"
        />
        {cityDropdownOpen && (
          <div className="absolute top-full left-0 mt-2.5 w-80 bg-white border border-outline-variant/50 rounded-2xl shadow-xl z-50 overflow-hidden py-1.5 max-h-80 overflow-y-auto">
            <div className="px-4.5 py-2.5 text-xs font-bold text-outline uppercase tracking-wider bg-surface-container-low/50">
              Gợi ý điểm đến
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
                  className="w-full text-left px-4.5 py-2.5 hover:bg-surface-container-low transition-colors flex items-center gap-3 border-b border-outline-variant/10 last:border-b-0"
                >
                  <IconComponent className="w-4.5 h-4.5 text-outline shrink-0 ml-1" />
                  <div className="text-sm font-semibold text-on-surface leading-tight">{dest.name}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Ward select field & Dropdown */}
      <div ref={wardRef} className="relative flex-1 h-full flex items-center gap-2 px-4">
        <MapPin className="w-4.5 h-4.5 text-primary shrink-0" />
        <button
          onClick={() => {
            setWardDropdownOpen(!wardDropdownOpen);
            setCityDropdownOpen(false);
            setFilterDropdownOpen(false);
          }}
          className="flex-1 text-left text-sm bg-transparent outline-none font-medium truncate"
        >
          {selectedWard ? (
            <span className="text-on-surface font-medium">{selectedWard.ward_name}</span>
          ) : (
            <span className="text-outline">Phường / Xã</span>
          )}
        </button>
        <ChevronDown className={`w-3.5 h-3.5 text-outline shrink-0 ml-auto transition-transform duration-200 ${wardDropdownOpen ? "rotate-180" : ""}`} />
        
        {wardDropdownOpen && (
          <div className="absolute top-full left-0 mt-2.5 w-80 bg-white border border-outline-variant/50 rounded-2xl shadow-xl z-50 overflow-hidden py-1.5 max-h-80 overflow-y-auto">
            {!selectedCity ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3 text-center px-5">
                <div className="w-12 h-12 rounded-full bg-primary/8 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary/50" />
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Chưa chọn địa điểm</p>
                  <p className="text-xs text-on-surface-variant mt-1 leading-snug">
                    Vui lòng chọn <span className="font-bold text-primary">Tỉnh / Thành phố</span> trước khi chọn Phường / Xã
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="px-4 py-2.5 text-xs font-bold text-outline uppercase tracking-wider bg-surface-container-low/50">
                  Phường / Xã tại {selectedCity.city_name}
                </div>
                {isLoadingWards ? (
                  <div className="px-4 py-4 text-xs text-on-surface-variant">Đang tải danh sách...</div>
                ) : wards.length > 0 ? (
                  wards.map((ward) => (
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
                  <div className="px-4 py-4 text-xs text-on-surface-variant">Không tìm thấy phường/xã nào</div>
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
          className="w-full h-full flex items-center justify-between px-4 text-sm font-medium text-left hover:bg-surface-container-low/10 transition-all rounded-r-full"
        >
          <span className="truncate flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-primary shrink-0" />
            {selectedServices.length > 0 ? (
              <span className="text-on-surface font-medium">
                {selectedServices.length <= 2 ? selectedServices.join(", ") : `${selectedServices.slice(0, 2).join(", ")}, ...`}
              </span>
            ) : (
              <span className="text-outline">Bộ lọc</span>
            )}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-outline shrink-0 ml-2" />
        </button>
        {filterDropdownOpen && (
          <div className="absolute top-full right-0 mt-2.5 w-80 bg-white border border-outline-variant/50 rounded-2xl shadow-2xl z-50 p-5 flex flex-col gap-4">
            {!selectedCity ? (
              <div className="flex flex-col items-center justify-center py-6 gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/8 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary/60" />
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Chọn địa điểm trước</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Vui lòng chọn Tỉnh / Thành phố để mở bộ lọc dịch vụ và giá
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2">
                    Dịch vụ bảo vệ (Tối đa 3)
                  </label>
                  <div className="flex flex-col gap-2 max-h-44 overflow-y-auto pr-1">
                    {availableServices.map((s) => {
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

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2">
                    Khoảng giá (đ/giờ)
                  </label>
                  <div className="flex justify-between text-xs font-bold text-primary bg-primary/5 rounded-lg px-3 py-2 mb-3">
                    <span>{(minPriceInput ?? 10000).toLocaleString("vi-VN")}đ</span>
                    <span className="text-outline">–</span>
                    <span>{maxPriceInput !== undefined && maxPriceInput < 500000 ? `${maxPriceInput.toLocaleString("vi-VN")}đ` : "Không giới hạn"}</span>
                  </div>
                  <DualRangeSlider
                    min={10000} max={500000} step={10000}
                    minVal={minPriceInput ?? 10000}
                    maxVal={maxPriceInput ?? 500000}
                    onChange={(lo, hi) => {
                      setMinPriceInput(lo > 10000 ? lo : undefined);
                      setMaxPriceInput(hi < 500000 ? hi : undefined);
                    }}
                  />
                  <div className="flex justify-between text-[10px] text-outline mt-1 font-medium">
                    <span>10.000đ</span><span>500.000đ+</span>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 border-t border-outline-variant/30 pt-3">
              <button onClick={handleResetFilters} className="px-3.5 py-1.5 text-xs font-bold text-outline-variant hover:text-primary transition-colors">
                Đặt lại
              </button>
              <button onClick={handleApplyFilters} className="px-4.5 py-1.5 text-xs font-bold bg-primary hover:bg-primary/95 text-white rounded-xl transition-colors shadow-sm">
                Áp dụng bộ lọc
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Search submit button */}
      <button
        onClick={() => handleSearchSubmit()}
        className="bg-primary hover:bg-primary/95 hover:scale-105 active:scale-95 text-on-primary w-10 h-10 rounded-full transition-all flex items-center justify-center shrink-0 shadow-sm ml-2"
      >
        <Search className="w-4.5 h-4.5" />
      </button>
    </div>
  );
}
