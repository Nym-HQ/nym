/**
 * Attributes in XML must be escaped if it contains some characters.
 *          "   &quot;
 *          '   &apos;
 *          <   &lt;
 *          >   &gt;
 *          &   &amp;
 *
 * In our case, we found & in the URL attributes.
 *
 * @param str
 * @returns
 */
export function fixXmlAttribute(str) {
  if (/&(?!amp;)/gi.test(str)) {
    str = str.replace(/(&(?!amp;))/gi, '&amp;')
  }
  return str
}
