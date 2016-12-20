import { assign } from 'lodash'
import isMobile from 'ismobilejs'

import { http } from '../services'
import { userStore, preferenceStore, artistStore, songStore, playlistStore, queueStore, settingStore } from '.'

export const sharedStore = {
  state: {
    songs: [],
    albums: [],
    artists: [],
    favorites: [],
    queued: [],
    interactions: [],
    users: [],
    settings: [],
    currentUser: null,
    playlists: [],
    useLastfm: false,
    useYouTube: false,
    useiTunes: true,
    allowDownload: false,
    currentVersion: '',
    latestVersion: '',
    cdnUrl: '',
    originalMediaPath: ''
  },

  init () {
    this.reset()

    return new Promise((resolve, reject) => {
      http.get('data', response => {
        assign(this.state, response.data)
        // Don't allow downloading on mobile devices
        this.state.allowDownload = this.state.allowDownload && !isMobile.any

        // Always disable YouTube integration on mobile.
        this.state.useYouTube = this.state.useYouTube && !isMobile.phone

        // If this is a new user, initialize his preferences to be an empty object.
        if (!this.state.currentUser.preferences) {
          this.state.currentUser.preferences = {}
        }

        userStore.init(this.state.users, this.state.currentUser)
        preferenceStore.init(this.state.preferences)
        artistStore.init(this.state.artists) // This will init album and song stores as well.
        songStore.initInteractions(this.state.interactions)
        playlistStore.init(this.state.playlists)
        queueStore.init()
        settingStore.init(this.state.settings)

        // Keep a copy of the media path. We'll need this to properly warn the user later.
        this.state.originalMediaPath = this.state.settings.media_path

        resolve(this.state)
      }, error => reject(error))
    })
  },

  reset () {
    this.state.songs = []
    this.state.albums = []
    this.state.artists = []
    this.state.favorites = []
    this.state.queued = []
    this.state.interactions = []
    this.state.users = []
    this.state.settings = []
    this.state.currentUser = null
    this.state.playlists = []
    this.state.useLastfm = false
    this.state.useYouTube = false
    this.state.useiTunes = true
    this.state.allowDownload = false
    this.state.currentVersion = ''
    this.state.latestVersion = ''
    this.state.cdnUrl = ''
  }
}
