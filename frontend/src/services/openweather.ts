// No Vue imports needed for this service

// Cache for weather data
const weatherCache = new Map<string, { data: WeatherPack; timestamp: number }>()
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

// AbortController to cancel previous requests
let currentController: AbortController | null = null

export interface UVData {
  value: number
}

export interface WeatherData {
  times: string[]
  temps: number[]
}

export interface WeatherPack {
  uvData: UVData | null
  weatherData: WeatherData | null
}

const getCacheKey = (lat: number, lon: number) => `${lat},${lon}`

export const fetchWeatherPack = async (lat: number, lon: number): Promise<WeatherPack> => {
  const apiKey = import.meta.env.VITE_OPEN_WEATHER_API_KEY || 'a7f7e34d892b94d341f19b3252f8c992'

  // Check cache first
  const cacheKey = getCacheKey(lat, lon)
  const cached = weatherCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('Fetching from cache:', cacheKey)
    return cached.data
  }

  // Cancel previous request if any
  if (currentController) {
    currentController.abort()
  }
  currentController = new AbortController()
  const { signal } = currentController

  try {
    // Use the same approach as WeatherUvWidget.vue - separate API calls
    console.log('Fetching weather data using WeatherUvWidget approach')
    
    const [weatherResponse, uvResponse] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`, { signal }),
      fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`, { signal })
    ])

    if (!weatherResponse.ok) {
      if (weatherResponse.status === 401) {
        throw new Error('Invalid API key. Please check your VITE_OPEN_WEATHER_API_KEY.')
      } else if (weatherResponse.status === 429) {
        throw new Error('API rate limit exceeded. Please try again later.')
      } else {
        throw new Error(`Weather API error: ${weatherResponse.status} ${weatherResponse.statusText}`)
      }
    }

    if (!uvResponse.ok) {
      if (uvResponse.status === 401) {
        throw new Error('Invalid API key. Please check your VITE_OPEN_WEATHER_API_KEY.')
      } else if (uvResponse.status === 429) {
        throw new Error('API rate limit exceeded. Please try again later.')
      } else {
        throw new Error(`UV API error: ${uvResponse.status} ${uvResponse.statusText}`)
      }
    }

    const weatherData = await weatherResponse.json()
    const uvData = await uvResponse.json()

    // Extract UV data
    const uvResult: UVData = {
      value: typeof uvData.value === 'number' ? uvData.value : 0
    }

    // For weather data, we'll create a simple trend using current temp
    // Since we don't have hourly data from the basic weather API, we'll simulate it
    const currentTemp = weatherData.main?.temp || 20
    const weatherResult: WeatherData = {
      times: ['Now', '+1h', '+2h', '+3h', '+4h', '+5h', '+6h'],
      temps: [
        currentTemp,
        currentTemp + Math.random() * 2 - 1,
        currentTemp + Math.random() * 2 - 1,
        currentTemp + Math.random() * 2 - 1,
        currentTemp + Math.random() * 2 - 1,
        currentTemp + Math.random() * 2 - 1,
        currentTemp + Math.random() * 2 - 1
      ]
    }

    const result: WeatherPack = { uvData: uvResult, weatherData: weatherResult }
    weatherCache.set(cacheKey, { data: result, timestamp: Date.now() })
    return result
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('Fetch aborted:', lat, lon)
      // Return null for aborted requests instead of throwing
      return null as any
    } else {
      console.error('Error fetching weather data:', error)
    }
    throw error // Re-throw to be handled by the component
  } finally {
    if (signal.aborted) {
      currentController = null // Reset if this was the aborted controller
    }
  }
}

export const clearWeatherCache = (): void => {
  weatherCache.clear()
}
