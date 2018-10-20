export const distance = (
  { lat: p1lat, lng: p1lng },
  { lat: p2lat, lng: p2lng }
) => {
	const rad = x => x * Math.PI / 180
	const R = 6378137 // Earth’s mean radius in meter
  
	const dLat = rad(p2lat - p1lat)
	const dLng = rad(p2lng - p1lng)
  
	const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
	  Math.cos(rad(p1lat)) * Math.cos(rad(p2lat)) *
	  Math.sin(dLng / 2) * Math.sin(dLng / 2)
	
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
	const d = R * c
	return d // returns the distance in meter
}

export const interpolate = (source, dest, meters) => {
  const dist = distance(source, dest)
  if (dist === 0) {
    return {
      lat: source.lat,
      lng: source.lng,
      dist: 0,
    }
  }

  const [deltaLat, deltaLng] = [dest.lat - source.lat, dest.lng - source.lng]
  const newDist = Math.max(0, dist - meters)

  const ratio = 1 - newDist / dist

  return {
    lat: source.lat + deltaLat * ratio,
    lng: source.lng + deltaLng * ratio,
    dist: newDist,
  }
}
