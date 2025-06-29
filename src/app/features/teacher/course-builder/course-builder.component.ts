import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    FormBuilder,
    FormGroup,
    FormArray,
    FormControl,
    Validators,
    ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import {
    CdkDragDrop,
    DragDropModule,
    moveItemInArray,
} from '@angular/cdk/drag-drop';
import {
    CourseService,
    CreateCourseRequest,
    CreateSectionRequest,
    CreateLessonRequest,
} from '../../courses/course.service';
import { AuthService } from '../../../core/services/auth.service';
import { forkJoin, switchMap, catchError, of } from 'rxjs';

// Interfaces for type safety
interface Lesson {
    id?: string;
    title: string;
    type: 'video' | 'text' | 'quiz' | 'assignment';
    duration?: number; // in minutes
    content?: string;
    videoUrl?: string;
    order: number;
}

interface Section {
    id?: string;
    title: string;
    description?: string;
    lessons: Lesson[];
    order: number;
}

@Component({
    selector: 'app-course-builder',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatTabsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatSlideToggleModule,
        MatExpansionModule,
        MatMenuModule,
        DragDropModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
    ],
    templateUrl: './course-builder.component.html',
    styleUrls: ['./course-builder.component.css'],
})
export class CourseBuilderComponent implements OnInit {
    courseForm!: FormGroup;
    isEditMode = false;
    courseId: number | null = null;
    activeTab = 0;
    isLoading = false;

    // Lesson types for dropdown
    lessonTypes = [
        { value: 'video', label: 'Video Lecture', icon: 'play_circle' },
        { value: 'text', label: 'Text Article', icon: 'article' },
        { value: 'quiz', label: 'Quiz', icon: 'quiz' },
        { value: 'assignment', label: 'Assignment', icon: 'assignment' },
    ];

    // Mock categories - in production, fetch from API
    categories = [
        { id: 1, name: 'Web Development' },
        { id: 2, name: 'Data Science' },
        { id: 3, name: 'Mobile Development' },
        { id: 4, name: 'Cloud Computing' },
        { id: 5, name: 'Business & Entrepreneurship' },
    ];

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private courseService: CourseService,
        private snackBar: MatSnackBar,
        private authService: AuthService
    ) {
        this.initializeForm();
    }

    ngOnInit(): void {
        this.initializeForm();

        // Check if we're in edit mode
        this.route.paramMap.subscribe((params) => {
            const id = params.get('id');
            if (id) {
                this.courseId = parseInt(id, 10);
                this.isEditMode = true;
                this.loadCourseData();
            }
        });
    }

    initializeForm(): void {
        this.courseForm = this.fb.group({
            title: ['', [Validators.required, Validators.maxLength(200)]],
            description: ['', [Validators.required]],
            price: [0, [Validators.required, Validators.min(0)]],
            categoryId: ['', Validators.required],
            thumbnailImageUrl: [''],
            isPublished: [false],
            curriculum: this.fb.array([]), // FormArray for sections
        });
    }

    // Curriculum FormArray getters
    get curriculumArray(): FormArray {
        return this.courseForm.get('curriculum') as FormArray;
    }

    getSectionFormGroup(sectionIndex: number): FormGroup {
        return this.curriculumArray.at(sectionIndex) as FormGroup;
    }

    getLessonsArray(sectionIndex: number): FormArray {
        return this.getSectionFormGroup(sectionIndex).get('lessons') as FormArray;
    }

    getLessonFormGroup(sectionIndex: number, lessonIndex: number): FormGroup {
        return this.getLessonsArray(sectionIndex).at(lessonIndex) as FormGroup;
    }

    // Section management methods
    addSection(): void {
        const sectionForm = this.fb.group({
            id: [this.generateId()],
            title: ['New Section', Validators.required],
            description: [''],
            order: [this.curriculumArray.length],
            lessons: this.fb.array([]),
        });

        this.curriculumArray.push(sectionForm);
    }

    removeSection(sectionIndex: number): void {
        this.curriculumArray.removeAt(sectionIndex);
        this.updateSectionOrders();
    }

    duplicateSection(sectionIndex: number): void {
        const sectionToCopy = this.curriculumArray.at(sectionIndex).value;
        const duplicatedSection = this.fb.group({
            id: [this.generateId()],
            title: [sectionToCopy.title + ' (Copy)', Validators.required],
            description: [sectionToCopy.description],
            order: [this.curriculumArray.length],
            lessons: this.fb.array(
                sectionToCopy.lessons.map((lesson: Lesson) =>
                    this.createLessonFormGroup({
                        ...lesson,
                        id: this.generateId(),
                        title: lesson.title + ' (Copy)',
                    })
                )
            ),
        });

        this.curriculumArray.push(duplicatedSection);
    }

    // Lesson management methods
    addLesson(sectionIndex: number, lessonType: string = 'video'): void {
        const lessonsArray = this.getLessonsArray(sectionIndex);
        const lessonForm = this.createLessonFormGroup({
            id: this.generateId(),
            title: 'New Lesson',
            type: lessonType as 'video' | 'text' | 'quiz' | 'assignment',
            duration: 0,
            content: '',
            videoUrl: '',
            order: lessonsArray.length,
        });

        lessonsArray.push(lessonForm);
    }

    removeLesson(sectionIndex: number, lessonIndex: number): void {
        const lessonsArray = this.getLessonsArray(sectionIndex);
        lessonsArray.removeAt(lessonIndex);
        this.updateLessonOrders(sectionIndex);
    }

    duplicateLesson(sectionIndex: number, lessonIndex: number): void {
        const lessonToCopy = this.getLessonFormGroup(
            sectionIndex,
            lessonIndex
        ).value;
        const duplicatedLesson = this.createLessonFormGroup({
            ...lessonToCopy,
            id: this.generateId(),
            title: lessonToCopy.title + ' (Copy)',
        });

        const lessonsArray = this.getLessonsArray(sectionIndex);
        lessonsArray.push(duplicatedLesson);
    }

    // Helper methods
    private createLessonFormGroup(lesson: Partial<Lesson>): FormGroup {
        return this.fb.group({
            id: [lesson.id || this.generateId()],
            title: [lesson.title || 'New Lesson', Validators.required],
            type: [lesson.type || 'video', Validators.required],
            duration: [lesson.duration || 0, [Validators.min(0)]],
            content: [lesson.content || ''],
            videoUrl: [lesson.videoUrl || ''],
            order: [lesson.order || 0],
        });
    }

    private generateId(): string {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    private updateSectionOrders(): void {
        this.curriculumArray.controls.forEach((section, index) => {
            section.get('order')?.setValue(index);
        });
    }

    private updateLessonOrders(sectionIndex: number): void {
        const lessonsArray = this.getLessonsArray(sectionIndex);
        lessonsArray.controls.forEach((lesson, index) => {
            lesson.get('order')?.setValue(index);
        });
    }

    // Drag and drop handlers
    onSectionDrop(event: CdkDragDrop<any[]>): void {
        moveItemInArray(
            this.curriculumArray.controls,
            event.previousIndex,
            event.currentIndex
        );
        this.updateSectionOrders();
    }

    onLessonDrop(event: CdkDragDrop<any[]>, sectionIndex: number): void {
        const lessonsArray = this.getLessonsArray(sectionIndex);
        moveItemInArray(
            lessonsArray.controls,
            event.previousIndex,
            event.currentIndex
        );
        this.updateLessonOrders(sectionIndex);
    }

    // Calculate total course duration
    getTotalCourseDuration(): number {
        let totalMinutes = 0;
        this.curriculumArray.controls.forEach((section) => {
            const lessonsArray = section.get('lessons') as FormArray;
            lessonsArray.controls.forEach((lesson) => {
                totalMinutes += lesson.get('duration')?.value || 0;
            });
        });
        return totalMinutes;
    }

    // Format duration for display
    formatDuration(minutes: number): string {
        if (minutes < 60) {
            return `${minutes}m`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0
            ? `${hours}h ${remainingMinutes}m`
            : `${hours}h`;
    }

    // Existing methods...
    loadCourse(): void {
        if (this.courseId) {
            const courseIdNum = parseInt(this.courseId.toString());
            this.courseService.getCourseById(courseIdNum).subscribe({
                next: (course: any) => {
                    this.courseForm.patchValue({
                        title: course.title,
                        description: course.description,
                        price: course.price,
                        categoryId: course.categoryId,
                        thumbnailImageUrl: course.thumbnailImageUrl,
                        isPublished: course.isPublished,
                    });
                    // Note: Curriculum loading will be implemented when backend supports it
                },
                error: (error: any) => {
                    console.error('Error loading course:', error);
                    this.snackBar.open('Failed to load course', 'Close', {
                        duration: 3000,
                    });
                    this.router.navigate(['/teacher/courses']);
                },
            });
        }
    }

    onSubmit(): void {
        if (this.courseForm.invalid) {
            this.snackBar.open('Please fill in all required fields', 'Close', {
                duration: 3000,
            });
            return;
        }

        // Get current user
        const currentUser = this.authService.getCurrentUserValue();
        if (!currentUser) {
            this.snackBar.open('Please log in to create a course', 'Close', {
                duration: 3000,
            });
            return;
        }

        this.isLoading = true;

        const formValue = this.courseForm.value;
        const courseData: CreateCourseRequest = {
            title: formValue.title,
            description: formValue.description,
            price: formValue.price,
            instructorId: currentUser.id,
            categoryId: formValue.categoryId,
            thumbnailImageUrl: formValue.thumbnailImageUrl,
            isPublished: formValue.isPublished || false,
        };

        // Get curriculum data
        const curriculum =
            formValue.curriculum?.map((section: any, index: number) => ({
                ...section,
                order: index,
            })) || [];

        if (this.isEditMode && this.courseId) {
            // Update existing course
            this.updateCourseWithCurriculum(courseData, curriculum);
        } else {
            // Create new course
            this.createCourseWithCurriculum(courseData, curriculum);
        }
    }

    private updateCourseWithCurriculum(
        courseData: CreateCourseRequest,
        curriculum: any[]
    ): void {
        if (!this.courseId) return;

        // First update the course basic info
        this.courseService
            .updateCourse(this.courseId, courseData)
            .pipe(
                switchMap(() => {
                    // For now, we'll just show success message
                    // In a full implementation, you'd want to handle curriculum updates too
                    this.snackBar.open('Course updated successfully!', 'Close', {
                        duration: 3000,
                    });
                    this.isLoading = false;

                    // Navigate back to teacher dashboard
                    this.router.navigate(['/teacher/dashboard']);
                    return of(null);
                }),
                catchError((error) => {
                    console.error('Error updating course:', error);
                    this.snackBar.open(
                        'Failed to update course. Please try again.',
                        'Close',
                        { duration: 5000 }
                    );
                    this.isLoading = false;
                    return of(null);
                })
            )
            .subscribe();
    }

    createCourseWithCurriculum(
        courseData: CreateCourseRequest,
        curriculum: any[]
    ): void {
        // First create the course
        this.courseService
            .createCourse(courseData)
            .pipe(
                switchMap((courseResponse) => {
                    console.log('Course created:', courseResponse);

                    // If no curriculum, just return the course
                    if (!curriculum || curriculum.length === 0) {
                        return of(courseResponse);
                    }

                    // Create sections and lessons
                    const sectionRequests = curriculum.map((section, sectionIndex) => {
                        const sectionData: CreateSectionRequest = {
                            title: section.title,
                            description: section.description,
                            order: sectionIndex,
                        };

                        return this.courseService
                            .createSection(courseResponse.id, sectionData)
                            .pipe(
                                switchMap((sectionResponse) => {
                                    // Create lessons for this section
                                    if (!section.lessons || section.lessons.length === 0) {
                                        return of(sectionResponse);
                                    }

                                    const lessonRequests = section.lessons.map(
                                        (lesson: any, lessonIndex: number) => {
                                            const lessonData: CreateLessonRequest = {
                                                title: lesson.title,
                                                type: lesson.type,
                                                duration: lesson.duration || 0,
                                                content: lesson.content,
                                                videoUrl: lesson.videoUrl,
                                                order: lessonIndex,
                                            };

                                            return this.courseService.createLesson(
                                                sectionResponse.id,
                                                lessonData
                                            );
                                        }
                                    );

                                    return forkJoin(lessonRequests);
                                })
                            );
                    });

                    return forkJoin(sectionRequests);
                }),
                catchError((error) => {
                    console.error('Error creating course with curriculum:', error);
                    this.snackBar.open(
                        'Failed to create course. Please try again.',
                        'Close',
                        { duration: 5000 }
                    );
                    this.isLoading = false;
                    return of(null);
                })
            )
            .subscribe({
                next: (result) => {
                    if (result) {
                        this.snackBar.open('Course created successfully!', 'Close', {
                            duration: 3000,
                        });
                        this.router.navigate(['/teacher/courses']);
                    }
                    this.isLoading = false;
                },
                error: (error: any) => {
                    console.error('Unexpected error:', error);
                    this.snackBar.open('An unexpected error occurred', 'Close', {
                        duration: 5000,
                    });
                    this.isLoading = false;
                },
            });
    }

    createCourse(courseData: CreateCourseRequest): void {
        this.courseService.createCourse(courseData).subscribe({
            next: (response) => {
                console.log('Course created successfully:', response);
                this.snackBar.open('Course created successfully!', 'Close', {
                    duration: 3000,
                });
                this.router.navigate(['/teacher/courses']);
            },
            error: (error: any) => {
                console.error('Error creating course:', error);
                this.snackBar.open(
                    'Failed to create course. Please try again.',
                    'Close',
                    { duration: 5000 }
                );
            },
        });
    }

    updateCourse(courseData: CreateCourseRequest): void {
        const courseIdNum = parseInt(this.courseId!.toString());
        this.courseService.updateCourse(courseIdNum, courseData).subscribe({
            next: () => {
                console.log('Course updated successfully');
                this.snackBar.open('Course updated successfully!', 'Close', {
                    duration: 3000,
                });
                this.router.navigate(['/teacher/courses']);
            },
            error: (error: any) => {
                console.error('Error updating course:', error);
                this.snackBar.open(
                    'Failed to update course. Please try again.',
                    'Close',
                    { duration: 5000 }
                );
            },
        });
    }

    onCancel(): void {
        this.router.navigate(['/teacher/courses']);
    }

    onTabChange(index: number): void {
        this.activeTab = index;
    }

    // File upload handlers
    onThumbnailSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            // TODO: Implement file upload
            console.log('Thumbnail selected:', file);
        }
    }

    // Preview mode
    previewCourse(): void {
        // TODO: Implement course preview
        console.log('Preview course');
    }

    private loadCourseData(): void {
        if (!this.courseId) return;

        this.isLoading = true;

        // Load course details and curriculum
        forkJoin({
            course: this.courseService.getCourseById(this.courseId),
            sections: this.courseService.getSectionsByCourse(this.courseId),
        })
            .pipe(
                switchMap(({ course, sections }) => {
                    // Populate basic course form
                    this.populateCourseForm(course);

                    // Load lectures for each section
                    if (sections.length > 0) {
                        const lectureRequests = sections.map((section) =>
                            this.courseService.getLecturesBySection(section.id).pipe(
                                catchError((error) => {
                                    console.error(
                                        `Error loading lectures for section ${section.id}:`,
                                        error
                                    );
                                    return of([]);
                                })
                            )
                        );

                        return forkJoin(lectureRequests).pipe(
                            switchMap((lecturesArrays) => {
                                // Combine sections with their lectures
                                const sectionsWithLectures = sections.map((section, index) => ({
                                    ...section,
                                    lectures: lecturesArrays[index] || [],
                                }));

                                this.populateCurriculumForm(sectionsWithLectures);
                                return of(null);
                            })
                        );
                    } else {
                        // No sections, just clear curriculum
                        this.clearCurriculum();
                        return of(null);
                    }
                }),
                catchError((error) => {
                    console.error('Error loading course data:', error);
                    this.snackBar.open(
                        'Failed to load course data. Please try again.',
                        'Close',
                        { duration: 5000 }
                    );
                    return of(null);
                })
            )
            .subscribe(() => {
                this.isLoading = false;
            });
    }

    private populateCourseForm(course: any): void {
        this.courseForm.patchValue({
            title: course.title,
            description: course.description,
            price: course.price,
            level: course.level,
            category: course.category,
            language: course.language,
            requirements: course.requirements || '',
            whatYoullLearn: course.whatYoullLearn || '',
        });
    }

    private populateCurriculumForm(sectionsWithLectures: any[]): void {
        // Clear existing curriculum
        this.clearCurriculum();

        // Add sections with their lessons
        sectionsWithLectures.forEach((section, sectionIndex) => {
            const sectionForm = this.fb.group({
                id: [section.id.toString()],
                title: [section.title, Validators.required],
                description: [section.description || ''],
                order: [section.order || sectionIndex],
                lessons: this.fb.array([]),
            });

            // Add lessons to this section
            const lessonsArray = sectionForm.get('lessons') as FormArray;
            section.lectures.forEach((lecture: any, lessonIndex: number) => {
                const lessonForm = this.fb.group({
                    id: [lecture.id.toString()],
                    title: [lecture.title, Validators.required],
                    type: ['video'], // Default to video since backend only supports video
                    duration: [lecture.durationInMinutes || 0],
                    content: [''],
                    videoUrl: [lecture.videoUrl || ''],
                    order: [lecture.order || lessonIndex],
                });

                lessonsArray.push(lessonForm);
            });

            this.curriculumArray.push(sectionForm);
        });
    }

    private clearCurriculum(): void {
        while (this.curriculumArray.length !== 0) {
            this.curriculumArray.removeAt(0);
        }
    }

    // Helper methods
    getTotalLessons(): number {
        return this.curriculumArray.controls.reduce((total, section) => {
            const lessonsArray = section.get('lessons') as FormArray;
            return total + lessonsArray.length;
        }, 0);
    }

    getTotalDuration(): number {
        return this.curriculumArray.controls.reduce((total, section) => {
            const lessonsArray = section.get('lessons') as FormArray;
            return (
                total +
                lessonsArray.controls.reduce((sectionTotal, lesson) => {
                    const duration = lesson.get('duration')?.value || 0;
                    return sectionTotal + duration;
                }, 0)
            );
        }, 0);
    }

    dropSection(event: CdkDragDrop<string[]>): void {
        if (event.previousIndex !== event.currentIndex) {
            const section = this.curriculumArray.at(event.previousIndex);
            this.curriculumArray.removeAt(event.previousIndex);
            this.curriculumArray.insert(event.currentIndex, section);
        }
    }
}
