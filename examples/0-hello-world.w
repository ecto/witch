[= {hello-world} "2: hello, world"]
[= {print-hello}
  [fn {name}
    {print "3:" "hello," name}
  ]
]

[print "1: hello, world"]
[print hello-world]
[print-hello "world"]
[print print-hello]
