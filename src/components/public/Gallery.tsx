"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

type GalleryItem = {
    id: number;
    src: string;
    alt: string;
};

const galleryItems: GalleryItem[] = [
    { id: 1, src: "/frizure/frizura-1.png", alt: "Frizura 1" },
    { id: 2, src: "/frizure/frizura-2.png", alt: "Frizura 2" },
    { id: 3, src: "/frizure/frizura-3.png", alt: "Frizura 3" },
    { id: 4, src: "/frizure/frizura-4.png", alt: "Frizura 4" },
];

export function Gallery() {
    // Stanje koje čuva broj (ID) trenutno otvorene slike. Ako je null, ništa nije otvoreno.
    const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

    useEffect(() => {
        if (selectedImage !== null)
            document.body.style.overflow = "hidden";

        else
            document.body.style.overflow = "unset";

        // "Cleanup" funkcija: ako korisnik promeni stranicu dok je slika otvorena,
        // osiguravamo da mu skrolovanje ne ostane blokirano.
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [selectedImage]);

    return (
        <>
            <section id="galerija" className="py-20 md:py-32">
                <div className="container mx-auto px-4 md:px-6 text-center">
                    <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">Galerija</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto mb-16 text-lg">
                        Prelistajte radove naših majstora i pronadjite inspiraciju za vas sledeći stil.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {galleryItems.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedImage(item)}
                                className="overflow-hidden aspect-square rounded-2xl overflow-hidden relative group bg-muted border border-border cursor-pointer"
                            >
                                <Image
                                    src={item.src}
                                    alt={item.alt}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                />

                                {/* TAMNI PRELAZ I TEKST "UVEĆAJ" NA HOVER */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <span className="text-white font-bold tracking-wider drop-shadow-md">Uvećaj</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* LIGHTBOX (MODAL) ZA UVEĆANU SLIKU */}
            {selectedImage !== null && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="absolute top-4 right-4 md:top-8 md:right-8 z-50 p-3 rounded-full bg-background/20 text-white hover:bg-background/40 hover:scale-105 transition-all shadow-lg backdrop-blur-md"
                        onClick={() => setSelectedImage(null)}
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Kontejner same slike */}
                    <div
                        // e.stopPropagation() sprečava da klik NA SLIKU ugasi modal
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-5xl aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden bg-muted shadow-2xl ring-1 ring-white/10"
                    >
                        <Image
                            src={selectedImage.src}
                            alt={selectedImage.alt}
                            fill
                            className="object-cover"
                            sizes="100vw"
                            priority
                        />
                    </div>
                </div>
            )}
        </>
    );
}
