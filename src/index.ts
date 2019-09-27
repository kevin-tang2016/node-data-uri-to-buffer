/**
 * Returns a `Buffer` instance from the given data URI `uri`.
 *
 * @param {String} uri Data URI to turn into a Buffer instance
 * @return {Buffer} Buffer instance from Data URI
 * @api public
 */

function dataUriToBuffer(uri: string): dataUriToBuffer.MimeBuffer {
	if (!/^data:/i.test(uri)) {
		throw new TypeError(
			'`uri` does not appear to be a Data URI (must begin with "data:")'
		);
	}

	// strip newlines
	uri = uri.replace(/\r?\n/g, '');

	// split the URI up into the "metadata" and the "data" portions
	let firstComma = uri.indexOf(',');
	if (firstComma === -1 || firstComma <= 4) {
		throw new TypeError('malformed data: URI');
	}

	// remove the "data:" scheme and parse the metadata
	let meta = uri.substring(5, firstComma).split(';');

	let type = meta[0] || 'text/plain';
	let typeFull = type;
	let base64 = false;
	let charset = '';
	for (let i = 1; i < meta.length; i++) {
		if (meta[i] === 'base64') {
			base64 = true;
		} else {
			typeFull += `;${  meta[i]}`;
			if (meta[i].indexOf('charset=') === 0) {
				charset = meta[i].substring(8);
			}
		}
	}
	// defaults to US-ASCII only if type is not provided
	if (!meta[0] && !charset.length) {
		typeFull += ';charset=US-ASCII';
		charset = 'US-ASCII';
	}

	// get the encoded data portion and decode URI-encoded chars
	let data = unescape(uri.substring(firstComma + 1));

	const encoding = base64 ? 'base64' : 'ascii';
	const buffer = (Buffer.from
		? Buffer.from(data, encoding)
		: new Buffer(data, encoding)) as dataUriToBuffer.MimeBuffer;

	// set `.type` and `.typeFull` properties to MIME type
	buffer.type = type;
	buffer.typeFull = typeFull;

	// set the `.charset` property
	buffer.charset = charset;

	return buffer;
}

namespace dataUriToBuffer {
	export interface MimeBuffer extends Buffer {
		type: string;
		typeFull: string;
		charset: string;
	}
}

export = dataUriToBuffer;