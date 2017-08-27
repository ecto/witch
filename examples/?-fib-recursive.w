[= {fib} [fn {n}
  {cond
    [[>? n 1]
      [+
        [fib [- n 1]]
        [fib [- n 2]]
      ]
    ]
    [[=? n 1] 1]
    [[=? n 0] 0]
    [else [print "invalid number"]]
  }
]]

[= {answer} [fib 5]]
[print answer]
