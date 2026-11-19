import { useCallback, useEffect, useMemo, useState } from "react";
import {
  loadMenuItems,
  loadMerchants,
  merchantLabel,
  type MenuItem,
  type Merchant,
} from "@/lib/data/merchants";
import {
  createOrder,
  estimateFare,
  type NewOrderItem,
} from "@/lib/data/orders";
import { loadPlaces, placeLabel, type Place } from "@/lib/data/places";
import { distanceKm } from "@/lib/geo";
import type { ServiceInfo } from "@/lib/services";

export function useBooking(service: ServiceInfo, userId: string) {
  const needsMerchant = service.merchantCategory !== null;

  const [places, setPlaces] = useState<Place[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(true);
  const [placesError, setPlacesError] = useState("");

  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loadingMerchants, setLoadingMerchants] = useState(needsMerchant);
  const [merchantsError, setMerchantsError] = useState("");

  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [menuError, setMenuError] = useState("");

  const [pickupId, setPickupId] = useState<string | null>(null);
  const [dropoffId, setDropoffId] = useState<string | null>(null);
  const [merchantPlaceId, setMerchantPlaceId] = useState<string | null>(null);

  const [cart, setCart] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [fare, setFare] = useState<number | null>(null);
  const [fareError, setFareError] = useState("");
  const [fareLoading, setFareLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPlaces = useCallback(async () => {
    setLoadingPlaces(true);
    const result = await loadPlaces();
    setPlaces(result.places);
    setPlacesError(result.error ?? "");
    setLoadingPlaces(false);
  }, []);

  const fetchMerchants = useCallback(async () => {
    if (!service.merchantCategory) return;

    setLoadingMerchants(true);
    const result = await loadMerchants(service.merchantCategory);
    setMerchants(result.merchants);
    setMerchantsError(result.error ?? "");
    setLoadingMerchants(false);
  }, [service.merchantCategory]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  useEffect(() => {
    if (needsMerchant) {
      fetchMerchants();
    }
  }, [needsMerchant, fetchMerchants]);

  useEffect(() => {
    if (!merchantId) {
      setMenuItems([]);
      setMenuError("");
      setLoadingMenu(false);
      return;
    }

    let active = true;
    setLoadingMenu(true);
    setMenuError("");

    loadMenuItems(merchantId).then((result) => {
      if (!active) return;
      setMenuItems(result.items);
      setMenuError(result.error ?? "");
      setLoadingMenu(false);
    });

    return () => {
      active = false;
    };
  }, [merchantId]);

  const merchant = useMemo(
    () => merchants.find((item) => item.id === merchantId) ?? null,
    [merchants, merchantId],
  );

  const pickup = useMemo(
    () => places.find((place) => place.id === pickupId) ?? null,
    [places, pickupId],
  );

  const dropoff = useMemo(
    () => places.find((place) => place.id === dropoffId) ?? null,
    [places, dropoffId],
  );

  const merchantPlace = useMemo(
    () => places.find((place) => place.id === merchantPlaceId) ?? null,
    [places, merchantPlaceId],
  );

  const distance = useMemo(() => {
    if (needsMerchant) {
      if (
        !merchant ||
        !merchantPlace ||
        merchant.latitude === null ||
        merchant.longitude === null
      ) {
        return null;
      }

      const value = distanceKm(
        { latitude: merchant.latitude, longitude: merchant.longitude },
        {
          latitude: merchantPlace.latitude,
          longitude: merchantPlace.longitude,
        },
      );

      return value > 0 ? value : null;
    }

    if (!pickup || !dropoff || pickup.id === dropoff.id) {
      return null;
    }

    const value = distanceKm(
      { latitude: pickup.latitude, longitude: pickup.longitude },
      { latitude: dropoff.latitude, longitude: dropoff.longitude },
    );

    return value > 0 ? value : null;
  }, [needsMerchant, merchant, merchantPlace, pickup, dropoff]);

  useEffect(() => {
    let active = true;

    if (distance === null) {
      setFare(null);
      setFareError("");
      setFareLoading(false);
      return;
    }

    setFareLoading(true);
    setFareError("");

    const timer = setTimeout(() => {
      estimateFare(service.key, distance).then((result) => {
        if (!active) return;

        setFareLoading(false);

        if (result.error) {
          setFare(null);
          setFareError(result.error);
          return;
        }

        setFare(result.fare);
        setFareError("");
      });
    }, 200);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [distance, service.key]);

  const itemCount = useMemo(
    () =>
      menuItems.reduce(
        (total, item) => total + (cart[item.id] ?? 0),
        0,
      ),
    [menuItems, cart],
  );

  const itemsTotal = useMemo(
    () =>
      menuItems.reduce(
        (total, item) => total + (cart[item.id] ?? 0) * item.price,
        0,
      ),
    [menuItems, cart],
  );

  function selectMerchant(nextMerchantId: string | null) {
    setMerchantId(nextMerchantId);
    setCart({});
    setFormError("");
  }

  async function retryMenu() {
    if (!merchantId) return;

    setLoadingMenu(true);
    setMenuError("");

    const result = await loadMenuItems(merchantId);
    setMenuItems(result.items);
    setMenuError(result.error ?? "");
    setLoadingMenu(false);
  }

  function setQuantity(menuItemId: string, quantity: number) {
    const next = Math.max(0, Math.min(99, quantity));

    setCart((current) => {
      const copy = { ...current };

      if (next === 0) {
        delete copy[menuItemId];
      } else {
        copy[menuItemId] = next;
      }

      return copy;
    });
    setFormError("");
  }

  async function submit(): Promise<string | null> {
    if (submitting) return null;

    setFormError("");

    if (loadingPlaces) {
      setFormError("Tunggu titik lokasi selesai dimuat.");
      return null;
    }

    if (placesError) {
      setFormError(placesError);
      return null;
    }

    let pickupPlaceId: string | null = null;
    let dropoffPlaceId: string | null = null;
    let pickupAddress: string | null = null;
    let dropoffAddress: string | null = null;

    if (needsMerchant) {
      if (!merchant) {
        setFormError("Pilih toko dulu ya.");
        return null;
      }

      if (merchant.latitude === null || merchant.longitude === null) {
        setFormError("Toko ini belum punya titik lokasi.");
        return null;
      }

      if (!merchantPlace) {
        setFormError(
          service.key === "laundry"
            ? "Pilih titik jemput dulu."
            : "Pilih titik antar dulu.",
        );
        return null;
      }

      if (distance === null) {
        setFormError("Titik tidak boleh sama dengan lokasi toko.");
        return null;
      }

      if (service.key === "laundry") {
        pickupPlaceId = merchantPlace.id;
        pickupAddress = placeLabel(merchantPlace);
        dropoffAddress = merchantLabel(merchant);
      } else {
        pickupAddress = merchantLabel(merchant);
        dropoffPlaceId = merchantPlace.id;
        dropoffAddress = placeLabel(merchantPlace);
      }

      if (
        (service.key === "food" || service.key === "mart") &&
        itemCount === 0
      ) {
        setFormError("Pilih minimal satu menu.");
        return null;
      }
    } else {
      if (!pickup) {
        setFormError("Pilih titik jemput dulu.");
        return null;
      }

      if (!dropoff) {
        setFormError("Pilih titik tujuan dulu.");
        return null;
      }

      if (distance === null) {
        setFormError("Titik jemput dan tujuan harus berbeda.");
        return null;
      }

      pickupPlaceId = pickup.id;
      dropoffPlaceId = dropoff.id;
      pickupAddress = placeLabel(pickup);
      dropoffAddress = placeLabel(dropoff);
    }

    if (service.key === "titip" && !notes.trim()) {
      setFormError("Tulis dulu apa yang mau dititip.");
      return null;
    }

    if (fareError) {
      setFormError(fareError);
      return null;
    }

    if (fare === null) {
      setFormError(
        fareLoading
          ? "Tarif masih dihitung. Tunggu sebentar."
          : "Tarif belum tersedia untuk titik ini.",
      );
      return null;
    }

    const items: NewOrderItem[] = needsMerchant
      ? menuItems
          .filter((item) => (cart[item.id] ?? 0) > 0)
          .map((item) => ({
            menuItemId: item.id,
            quantity: cart[item.id] ?? 0,
          }))
      : [];

    setSubmitting(true);

    const result = await createOrder({
      customerId: userId,
      serviceType: service.key,
      merchantId: merchant?.id ?? null,
      pickupPlaceId,
      dropoffPlaceId,
      pickupAddress,
      dropoffAddress,
      distanceKm: distance,
      notes: notes.trim() || null,
      items,
    });

    setSubmitting(false);

    if (result.error) {
      setFormError(result.error);
      return null;
    }

    return result.orderId;
  }

  return {
    needsMerchant,
    places,
    loadingPlaces,
    placesError,
    retryPlaces: fetchPlaces,
    merchants,
    loadingMerchants,
    merchantsError,
    retryMerchants: fetchMerchants,
    merchant,
    merchantId,
    selectMerchant,
    menuItems,
    loadingMenu,
    menuError,
    retryMenu,
    cart,
    setQuantity,
    pickup,
    pickupId,
    setPickupId,
    dropoff,
    dropoffId,
    setDropoffId,
    merchantPlace,
    merchantPlaceId,
    setMerchantPlaceId,
    distance,
    fare,
    fareError,
    fareLoading,
    itemCount,
    itemsTotal,
    notes,
    setNotes,
    formError,
    submitting,
    submit,
  };
}
