	.text
	.file	"out.bc"
	.globl	main
	.p2align	4, 0x90
	.type	main,@function
main:                                   # @main
	.cfi_startproc
# BB#0:                                 # %entrypoint
	pushq	%rax
.Lcfi0:
	.cfi_def_cfa_offset 16
	movabsq	$4631107791820423168, %rax # imm = 0x4045000000000000
	movq	%rax, (%rsp)
	movq	%rsp, %rdi
	callq	puts
	xorl	%eax, %eax
	popq	%rcx
	retq
.Lfunc_end0:
	.size	main, .Lfunc_end0-main
	.cfi_endproc


	.section	".note.GNU-stack","",@progbits
