[set foo 3]

[set printHello
  [fn [name]
    [echo '2:']
    [echo 'hello,']
    [echo name]
  ]
]

[set main
  [fn []
    [echo '1: hello, world']
    [printHello 'world']
    [echo printHello]
  ]
]
