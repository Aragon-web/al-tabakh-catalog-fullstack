"use client"

import dynamic from "next/dynamic"

export const LocationsClient = dynamic(() => import("./locations-client").then(m => m.LocationsClient), { ssr: false })
