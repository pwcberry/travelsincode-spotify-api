/**
 * @typedef {Object} SpotifyExternalUrls
 * @property {string} spotify
 */
/**
 * @typedef {Object} SpotifyArtist
 * @property {string} id
 * @property {string} name
 * @property {SpotifyExternalUrls} external_urls
 */
class Artist {
  /**
   * Transform a Spotify Artist object.
   * @param {SpotifyArtist} spotifyArtist
   */
  constructor(spotifyArtist) {
    this.id = spotifyArtist.id;
    this.name = spotifyArtist.name;
    /** @member {string} */
    this.spotifyUrl = spotifyArtist.external_urls?.spotify;
  }
}

/**
 * @typedef {Object} SpotifyTrack
 * @property {string} id
 * @property {string} name
 * @property {number} duration_ms
 * @property {SpotifyArtist[]} artists
 * @property {number} track_number
 * @property {number} disc_number
 * @property {SpotifyExternalUrls} external_urls
 */
class Track {
  /**
   * Transform a Spotify Track object.
   * @param {SpotifyTrack} spotifyTrack
   */
  constructor(spotifyTrack) {
    /** @member {string} */
    this.id = spotifyTrack.id;
    /** @member {string} */
    this.name = spotifyTrack.name;
    /** @member {number} */
    this.duration = spotifyTrack.duration_ms ?? 0;
    /** @member {Artist[]} */
    this.artists = spotifyTrack.artists?.map((artist) => new Artist(artist)) ?? [];
    /** @member {number} */
    this.trackNumber = spotifyTrack.track_number;
    /** @member {number} */
    this.discNumber = spotifyTrack.disc_number;
    /** @member {string} */
    this.spotifyUrl = spotifyTrack.external_urls?.spotify;
  }
}

/**
 * @typedef {Object} SpotifyImage
 * @property {string} url
 * @property {number} width
 * @property {number} height
 */
class AlbumImage {
  /**
   * Transform a Spotify Image object.
   * @param {SpotifyImage} spotifyImage
   */
  constructor(spotifyImage) {
    this.url = spotifyImage.url;
    this.height = spotifyImage.height ?? 0;
    this.width = spotifyImage.width ?? 0;
  }
}

/**
 * @typedef {Object} SpotifyCopyright
 * @property {string} text
 * @property {string} type
 */
/**
 * @typedef {Object} SpotifyAlbum
 * @property {string} id
 * @property {string} name
 * @property {string} album_type
 * @property {number} total_tracks
 * @property {string} added_at
 * @property {SpotifyExternalUrls} external_urls
 * @property {SpotifyImage[]} images
 * @property {string} release_date
 * @property {string} release_date_precision
 * @property {SpotifyArtist[]} artists
 * @property {Object} tracks
 * @property {SpotifyTrack[]} tracks.items
 * @property {SpotifyCopyright[]} copyrights
 * @property {Object.<string>} external_ids
 * @property {string} label
 * @property {number} popularity
 */
class Album {
  /**
   * Transform a Spotify Album object.
   * @param {Object} spotifyAlbum
   * @param {string} spotifyAlbum.added_at
   * @param {SpotifyAlbum} spotifyAlbum.album
   */
  constructor(spotifyAlbum) {
    const { album, added_at } = spotifyAlbum;
    this.addedAt = added_at;
    this.id = album.id;
    this.name = album.name;
    this.spotifyUrl = album.external_urls?.spotify;
    this.type = album.album_type;
    this.trackCount = album.total_tracks;
    this.copyrights = album.copyrights;
    this.label = album.label;
    this.popularity = album.popularity;

    /** @member {Object.<string>} */
    this.externalIds = album.external_ids;

    const image = Array.isArray(album.images) ? album.images[0] : { url: "" };
    this.image = new AlbumImage(image);

    this.tracks = album.tracks?.items.map((track) => new Track(track)) ?? [];
    this.artists = album.artists?.map((artist) => new Artist(artist)) ?? [];

    this.release = {
      date: album.release_date,
      precision: album.release_date_precision,
    };
  }
}

export { Album, Artist, Track };
