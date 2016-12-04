[= {unpack} [fn {f l} {
  eval [join [list f] l]
}]]

[= {pack} [fn {f & xs} {f xs}]]

[= {curry} unpack]
[= {uncurry} pack]
