export function xHandleFromUrl(value: string | null) {
  if (!value) return null

  try {
    const url = new URL(value)
    const segments = url.pathname.split('/').filter(Boolean)
    let handle: string | undefined = segments[0]

    if (handle === 'i') {
      handle = url.searchParams
        .get('redirect_after_login')
        ?.split('/')
        .filter(Boolean)[0]
    }

    return handle ? `@${decodeURIComponent(handle).replace(/^@/, '')}` : null
  } catch {
    return null
  }
}

function xUrlsFromValue(value: string | null) {
  if (!value) return []

  return value
    .split(/\s*;\s*(?=https?:\/\/)/i)
    .map((url) => url.trim())
    .filter(Boolean)
}

export function xHandlesFromValue(value: string | null) {
  const handles: string[] = []
  const seenHandles = new Set<string>()

  for (const url of xUrlsFromValue(value)) {
    const handle = xHandleFromUrl(url)
    const normalizedHandle = handle?.toLocaleLowerCase()

    if (!handle || !normalizedHandle || seenHandles.has(normalizedHandle)) {
      continue
    }

    seenHandles.add(normalizedHandle)
    handles.push(handle)
  }

  return handles
}

export function firstXUrlFromValue(value: string | null) {
  return xUrlsFromValue(value).find((url) => xHandleFromUrl(url)) ?? null
}

export function emailAddressesFromValue(value: string | null) {
  if (!value) return []

  return value
    .split(/\s*;\s*(?:mailto:)?/i)
    .map((address) => address.replace(/^mailto:/i, '').trim())
    .filter((address) => address.includes('@'))
}
