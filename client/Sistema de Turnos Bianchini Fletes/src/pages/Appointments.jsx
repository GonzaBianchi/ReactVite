import { useState, useEffect } from 'react'
// import { DayPicker } from 'react-day-picker'
import Calendar from '../components/Calendar.jsx'
import { format, startOfToday } from 'date-fns'
import axiosInstance from '../axioConfig' 

// eslint-disable-next-line react/prop-types
const Appointments = ({ username }) => {
  const [selectedDay, setSelectedDay] = useState(undefined)
  const [selectedTime, setSelectedTime] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [availableTimeSlots, setAvailableTimeSlots] = useState([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [noSlotsAvailable, setNoSlotsAvailable] = useState(false)
  const [appointmentData, setAppointmentData] = useState({
    start_address: '',
    end_address: '',
    stairs: '',
    description: '',
    staff: false,  // Checkbox para staff
  })

  const [prices, setPrices] = useState({ hour: 0, stairs: 0, 'extra personal': 0, distance: 0 })

// Obtener precios del backend
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await axiosInstance.get('/prices') 
        const pricesData = response.data.reduce((acc, price) => {
          acc[price.service_name] = price.price 
          return acc 
        }, {}) 
        setPrices(pricesData) 
      } catch (error) {
        console.error('Error fetching prices:', error) 
      }
    }
    fetchPrices()
  }, [])

  const [estimatedPrice, setEstimatedPrice] = useState(prices.hour + prices.distance) // Inicializado con el valor de la hora

  const handleStaffChange = (e) => {
    const isChecked = e.target.checked
    setAppointmentData((prevData) => ({
      ...prevData,
      staff: isChecked
    }))
    const extraStaffPrice = isChecked ? prices['extra personal'] : 0 
    setEstimatedPrice(prices.hour + appointmentData.stairs * prices.stairs + extraStaffPrice + prices.distance)
  }
  

  const handleStairsChange = (e) => {
    const stairs = parseInt(e.target.value, 10) || 0 
    setAppointmentData((prevData) => ({
      ...prevData,
      stairs
    })) 
    setEstimatedPrice(prices.hour + stairs * prices.stairs + (appointmentData.staff ? prices['extra personal'] : 0)) 
  } 
  

  const handleDaySelect = (day, modifiers) => {
    if (modifiers.selected) {
      return
    }
    setSelectedDay(day)
    setSelectedTime(null)
    setShowForm(false)
    fetchAvailableTimes(day)
    
    if (day.getMonth() !== currentMonth.getMonth()) {
      setCurrentMonth(day)
    }
  }

  const fetchAvailableTimes = async (day) => {
    const formattedDate = format(day, 'yyyy-MM-dd')

    try {
      const response = await axiosInstance.get(`/appointment/available-times?day=${formattedDate}`)
      const data = await response.json()

      if (data.availableTimes.length > 0) {
        setAvailableTimeSlots(data.availableTimes)
        setNoSlotsAvailable(false)
      } else {
        setAvailableTimeSlots([])
        setNoSlotsAvailable(true)  // Mostrar mensaje si no hay horarios
      }
    } catch (error) {
      console.error('Error fetching available time slots:', error)
    }
  }

  const handleTimeClick = (time) => {
    setSelectedTime(time)
    setShowForm(true)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setAppointmentData({
      ...appointmentData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const appointment = {
        ...appointmentData,
        username,  // Pasamos el username como campo oculto
        day: format(selectedDay, 'yyyy-MM-dd'),
        schedule: selectedTime,
      }

      const response = await axiosInstance.post('/appointments', appointment)
      console.log('Appointment created:', response.data)
      setShowForm(false)
    } catch (error) {
      console.error('Error creating appointment:', error)
    }
  }

  const disabledDays = [
    { before: startOfToday() },
  ]

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Turnero</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Calendar
          selectedDay={selectedDay}
          handleDaySelect={handleDaySelect}
          disabledDays={disabledDays}
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
        />

        {selectedDay && (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-2">
              Select a Time for {format(selectedDay, 'MMMM d, yyyy')}
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {noSlotsAvailable ? (
                <p className="text-red-500">No appointments available for this day</p>
              ) : (
                availableTimeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => handleTimeClick(time)}
                    className={`py-2 px-4 rounded-md ${
                      selectedTime === time
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {time}
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {showForm && (
          <div className="md:col-span-3 bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-2">Appointment Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" name="username" value={username} />
              <div>
                <label htmlFor="start_address" className="block text-sm font-medium text-gray-700">Start Address</label>
                <input
                  type="text"
                  id="start_address"
                  name="start_address"
                  value={appointmentData.start_address}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300"
                  placeholder="Enter start address"
                />
              </div>
              <div>
                <label htmlFor="end_address" className="block text-sm font-medium text-gray-700">End Address</label>
                <input
                  type="text"
                  id="end_address"
                  name="end_address"
                  value={appointmentData.end_address}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300"
                  placeholder="Enter end address"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={appointmentData.description}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300"
                  placeholder="Enter description"
                />
              </div>
              <div>
                <label htmlFor="stairs" className="block text-sm font-medium text-gray-700">Stairs</label>
                <input
                  type="number"
                  id="stairs"
                  name="stairs"
                  value={appointmentData.stairs}
                  onChange={handleStairsChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  placeholder="Enter number of stairs"
                />
              </div>

              <div>
                <label htmlFor="staff" className="block text-sm font-medium text-gray-700">Extra Staff</label>
                <input
                  type="checkbox"
                  id="staff"
                  name="staff"
                  checked={appointmentData.staff}
                  onChange={handleStaffChange}
                  className="mt-1 block"
                />
              </div>

              <div>
                <p className="text-lg font-semibold">Estimated Price: ${estimatedPrice}</p>
              </div>

              <input type="hidden" name="cost" value={estimatedPrice} />
              
              <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">
                Book Appointment
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default Appointments 
