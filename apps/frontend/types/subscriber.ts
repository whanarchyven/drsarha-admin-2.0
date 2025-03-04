export interface Subscriber {
  _id: {
    $oid: string
  }
  email: string
  phone: string
  password: string
  subscribeTill: string
  fullName: string
  city: string
  workplace: string
  position: string
  diploma: string
  specialization: string
  telegram: string
  tariff: string
  isApproved: boolean
}

