class Location {
  private static location: string
  private static subscribers: ((location: string) => void)[] = []

  static get() {
    return this.location
  }

  static set(location: string) {
    this.location = location
    this.subscribers.forEach((subscriber) => subscriber(location))
  }

  static subscribe(callback: (location: string) => void) {
    this.subscribers.push(callback)
  }
}

export { Location }
