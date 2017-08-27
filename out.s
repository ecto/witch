	.text
	.file	"out.bc"
	.globl	"print-hello"
	.p2align	4, 0x90
	.type	"print-hello",@function
"print-hello":                          # @print-hello
	.cfi_startproc
# BB#0:                                 # %entrypoint
	pushq	%rbx
.Lcfi0:
	.cfi_def_cfa_offset 16
	subq	$16, %rsp
.Lcfi1:
	.cfi_def_cfa_offset 32
.Lcfi2:
	.cfi_offset %rbx, -16
	movq	%rdi, %rbx
	movb	$0, 8(%rsp)
	movb	$58, 7(%rsp)
	movb	$51, 6(%rsp)
	leaq	6(%rsp), %rdi
	callq	puts
	movb	$0, 15(%rsp)
	movb	$44, 14(%rsp)
	movb	$111, 13(%rsp)
	movb	$108, 12(%rsp)
	movb	$108, 11(%rsp)
	movb	$101, 10(%rsp)
	movb	$104, 9(%rsp)
	leaq	9(%rsp), %rdi
	callq	puts
	movq	%rbx, %rdi
	callq	puts
	xorl	%eax, %eax
	addq	$16, %rsp
	popq	%rbx
	retq
.Lfunc_end0:
	.size	"print-hello", .Lfunc_end0-"print-hello"
	.cfi_endproc

	.globl	main
	.p2align	4, 0x90
	.type	main,@function
main:                                   # @main
	.cfi_startproc
# BB#0:                                 # %entrypoint
	subq	$24, %rsp
.Lcfi3:
	.cfi_def_cfa_offset 32
	movb	$0, 23(%rsp)
	movb	$100, 22(%rsp)
	movb	$108, 21(%rsp)
	movb	$114, 20(%rsp)
	movb	$111, 19(%rsp)
	movb	$119, 18(%rsp)
	movb	$32, 17(%rsp)
	movb	$44, 16(%rsp)
	movb	$111, 15(%rsp)
	movb	$108, 14(%rsp)
	movb	$108, 13(%rsp)
	movb	$101, 12(%rsp)
	movb	$104, 11(%rsp)
	movb	$32, 10(%rsp)
	movb	$58, 9(%rsp)
	movb	$49, 8(%rsp)
	leaq	8(%rsp), %rdi
	callq	puts
	movb	$0, 7(%rsp)
	movb	$100, 6(%rsp)
	movb	$108, 5(%rsp)
	movb	$114, 4(%rsp)
	movb	$111, 3(%rsp)
	movb	$119, 2(%rsp)
	leaq	2(%rsp), %rdi
	callq	"print-hello"
	movl	$"print-hello", %edi
	callq	puts
	xorl	%eax, %eax
	addq	$24, %rsp
	retq
.Lfunc_end1:
	.size	main, .Lfunc_end1-main
	.cfi_endproc


	.section	".note.GNU-stack","",@progbits
