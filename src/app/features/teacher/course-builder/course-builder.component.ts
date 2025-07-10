import { Component, OnInit, OnDestroy } from '@angular/core';
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
    CreateCourseWithFileRequest,
    CreateCourseRequest,
    UpdateCourseWithFileRequest,
    UpdateCourseRequest,
    CreateSectionRequest,
    CreateLessonRequest,
    CourseCreationResponse,
} from '../../courses/course.service';
import { CategoryService, Category } from '../../courses/category.service';
import { AuthService } from '../../../core/services/auth.service';
import { forkJoin, switchMap, catchError, of } from 'rxjs';
import { MatProgressBarModule } from '@angular/material/progress-bar';

// Interfaces for type safety
interface Lesson {
    id?: string;
    title: string;
    type: 'video' | 'text' | 'quiz' | 'assignment';
    duration?: number; // in minutes
    content?: string;
    videoUrl?: string;
    order: number;
    videoFile?: File; // For temporary storage of video file
    videoPreviewUrl?: string; // For preview URL
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
        MatProgressBarModule,
        MatSnackBarModule,
    ],
    templateUrl: './course-builder.component.html',
    styleUrls: ['./course-builder.component.css'],
})
export class CourseBuilderComponent implements OnInit, OnDestroy {
    courseForm!: FormGroup;
    isEditMode = false;
    courseId: number | null = null;
    activeTab = 0;
    isLoading = false;
    thumbnailFile: File | null = null; // Store the selected thumbnail file
    thumbnailPreviewUrl: string | null = null; // Store the preview URL for the selected thumbnail

    // Lesson types for dropdown
    lessonTypes = [
        { value: 'video', label: 'Video Lecture', icon: 'play_circle' },
        { value: 'text', label: 'Text Article', icon: 'article' },
        { value: 'quiz', label: 'Quiz', icon: 'quiz' },
        { value: 'assignment', label: 'Assignment', icon: 'assignment' },
    ];

    // Categories fetched from API
    categories: Category[] = [];

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private courseService: CourseService,
        private categoryService: CategoryService,
        private snackBar: MatSnackBar,
        private authService: AuthService
    ) {
        this.initializeForm();
    }

    ngOnInit(): void {
        this.initializeForm();

        // Fetch categories first
        this.loadCategories().then(() => {
            // Check if we're in edit mode after categories are loaded
        this.route.paramMap.subscribe((params) => {
            const id = params.get('id');
            if (id) {
                this.courseId = parseInt(id, 10);
                this.isEditMode = true;
                this.loadCourseData();
            }
            });
        });
    }

    ngOnDestroy(): void {
        // Clean up thumbnail preview URL to prevent memory leaks
        if (this.thumbnailPreviewUrl) {
            URL.revokeObjectURL(this.thumbnailPreviewUrl);
        }
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
            isUploadingVideo: [false], // Added for video upload status
            videoFile: [null], // For storing the file temporarily
            videoPreviewUrl: [''], // For storing the preview URL
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
        const courseData: CreateCourseWithFileRequest = {
            title: formValue.title,
            description: formValue.description,
            price: formValue.price,
            // ✅ Removed instructorId - will be extracted from auth token on backend
            categoryId: formValue.categoryId,
            thumbnailFile: this.thumbnailFile || undefined, // Convert null to undefined
            isPublished: formValue.isPublished || false,
        };

        // Get curriculum data
        const curriculum =
            formValue.curriculum?.map((section: any, index: number) => ({
                ...section,
                order: index,
            })) || [];

        if (this.isEditMode && this.courseId) {
            // Update existing course - for now, just update basic info
            // TODO: Implement full curriculum update for edit mode
            const updateData = {
                title: formValue.title,
                description: formValue.description,
                price: formValue.price,
                categoryId: formValue.categoryId,
                thumbnailImageUrl: formValue.thumbnailImageUrl, // Keep existing logic for edit mode
                isPublished: formValue.isPublished || false,
            };
            this.updateCourseWithCurriculum(updateData, curriculum);
        } else {
            // Create new course
            this.createCourseWithCurriculum(courseData, curriculum);
        }
    }

    private updateCourseWithCurriculum(
        courseData: any,
        curriculum: any[]
    ): void {
        if (!this.courseId) return;

        const formValue = this.courseForm.value;
        
        // Determine if we need to use the file upload version
        const shouldUseFileUpload = this.thumbnailFile !== null;
        
        let updateObservable;
        
        if (shouldUseFileUpload) {
            // Use the file upload version
            const updateDataWithFile: UpdateCourseWithFileRequest = {
                title: formValue.title,
                description: formValue.description,
                price: formValue.price,
                isPublished: formValue.isPublished || false,
                categoryId: formValue.categoryId,
                thumbnailImageUrl: formValue.thumbnailImageUrl,
                thumbnailFile: this.thumbnailFile || undefined,
            };
            updateObservable = this.courseService.updateCourseWithFile(this.courseId, updateDataWithFile);
        } else {
            // Use the regular JSON version with proper structure
            const updateData: UpdateCourseRequest = {
                title: formValue.title,
                description: formValue.description,
                price: formValue.price,
                isPublished: formValue.isPublished || false,
                categoryId: formValue.categoryId,
                thumbnailImageUrl: formValue.thumbnailImageUrl,
            };
            updateObservable = this.courseService.updateCourse(this.courseId, updateData);
        }

        // First update the course basic info
        updateObservable
            .pipe(
                switchMap(() => {
                    // Now handle curriculum updates
                    if (!curriculum || curriculum.length === 0) {
                        return of(null);
                    }

                    // Process curriculum changes
                    const updatePromises: Promise<any>[] = [];

                    curriculum.forEach((section, sectionIndex) => {
                        // Check if section is new (has temporary ID) or existing
                        const sectionId = section.id;
                        
                        if (sectionId.toString().startsWith('id_')) {
                            // New section - create it
                            const sectionData: CreateSectionRequest = {
                                title: section.title,
                                description: section.description,
                                order: sectionIndex,
                            };
                            
                            const promise = this.courseService.createSection(this.courseId!, sectionData)
                                .pipe(
                                    switchMap((sectionResponse) => {
                                        // Create lessons for new section
                                        return this.createLessonsForSection(section.lessons, sectionResponse.id, sectionIndex);
                                    })
                                ).toPromise();
                            
                            updatePromises.push(promise);
                        } else {
                            // Existing section - handle lessons
                            section.lessons.forEach((lesson: any, lessonIndex: number) => {
                                const lectureId = lesson.id;
                                
                                if (lectureId.toString().startsWith('id_')) {
                                    // New lesson in existing section
                                    const lessonData: CreateLessonRequest = {
                                        title: lesson.title,
                                        type: lesson.type,
                                        duration: lesson.duration || 0,
                                        content: lesson.content,
                                        videoUrl: '',
                                        order: lessonIndex,
                                    };
                                    
                                    const promise = this.courseService.createLesson(parseInt(sectionId), lessonData)
                                        .pipe(
                                            switchMap((lessonResponse) => {
                                                // Upload video if present
                                                const videoFile = lesson.videoFile;
                                                if (videoFile && lesson.type === 'video') {
                                                    return this.uploadVideoForLesson(
                                                        videoFile,
                                                        lessonResponse.id,
                                                        sectionIndex,
                                                        lessonIndex
                                                    ).then(() => lessonResponse);
                                                }
                                                return of(lessonResponse);
                                            })
                                        ).toPromise();
                                    
                                    updatePromises.push(promise);
                                } else {
                                    // Existing lesson - check if video needs upload
                                    const videoFile = lesson.videoFile;
                                    if (videoFile && lesson.type === 'video') {
                                        const promise = this.uploadVideoForLesson(
                                            videoFile,
                                            parseInt(lectureId),
                                            sectionIndex,
                                            lessonIndex
                                        );
                                        updatePromises.push(promise);
                                    }
                                }
                            });
                        }
                    });

                    // Wait for all updates to complete
                    return Promise.all(updatePromises);
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
            .subscribe({
                next: (result) => {
                    this.snackBar.open('Course updated successfully!', 'Close', {
                        duration: 3000,
                    });
                    this.isLoading = false;
                    this.router.navigate(['/teacher/dashboard']);
                },
                error: (error) => {
                    console.error('Unexpected error:', error);
                    this.snackBar.open('An unexpected error occurred', 'Close', {
                        duration: 5000,
                    });
                    this.isLoading = false;
                }
            });
    }

    private async createLessonsForSection(lessons: any[], sectionId: number, sectionIndex: number): Promise<any> {
        if (!lessons || lessons.length === 0) {
            return Promise.resolve();
        }

        const lessonPromises = lessons.map((lesson: any, lessonIndex: number) => {
            const lessonData: CreateLessonRequest = {
                title: lesson.title,
                type: lesson.type,
                duration: lesson.duration || 0,
                content: lesson.content,
                videoUrl: '',
                order: lessonIndex,
            };

            return this.courseService.createLesson(sectionId, lessonData)
                .pipe(
                    switchMap((lessonResponse) => {
                        // Upload video if present
                        const videoFile = lesson.videoFile;
                        if (videoFile && lesson.type === 'video') {
                            return this.uploadVideoForLesson(
                                videoFile,
                                lessonResponse.id,
                                sectionIndex,
                                lessonIndex
                            ).then(() => lessonResponse);
                        }
                        return of(lessonResponse);
                    })
                ).toPromise();
        });

        return Promise.all(lessonPromises);
    }

    createCourseWithCurriculum(
        courseData: CreateCourseWithFileRequest,
        curriculum: any[]
    ): void {
        // First create the course
        this.courseService
            .createCourse(courseData) // Use the corrected method name
            .pipe(
                switchMap((courseResponse) => {
                    console.log('Course created:', courseResponse);

                    // If no curriculum, just return the course
                    if (!curriculum || curriculum.length === 0) {
                        return of(courseResponse);
                    }

                    // Create sections and lessons with video uploads
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
                                                videoUrl: '', // Will be updated after video upload
                                                order: lessonIndex,
                                            };

                                            return this.courseService.createLesson(
                                                sectionResponse.id,
                                                lessonData
                                            ).pipe(
                                                switchMap((lessonResponse) => {
                                                    // Check if this lesson has a video file to upload
                                                    const videoFile = lesson.videoFile;
                                                    if (videoFile && lesson.type === 'video') {
                                                        // Upload the video for this lesson
                                                        return this.uploadVideoForLesson(
                                                            videoFile, 
                                                            lessonResponse.id, 
                                                            sectionIndex, 
                                                            lessonIndex
                                                        ).then(() => lessonResponse);
                                                    }
                                                    return of(lessonResponse);
                                                })
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
            // Validate file type
            if (!file.type.startsWith('image/')) {
                this.snackBar.open('Please select a valid image file.', 'Close', {
                    duration: 3000,
                });
                return;
            }

            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB in bytes
            if (file.size > maxSize) {
                this.snackBar.open('Image file size must be less than 5MB.', 'Close', {
                    duration: 3000,
                });
                return;
            }

            // Clean up previous preview URL to prevent memory leaks
            if (this.thumbnailPreviewUrl) {
                URL.revokeObjectURL(this.thumbnailPreviewUrl);
            }

            // Store the thumbnail file for later upload
            this.thumbnailFile = file;
            this.thumbnailPreviewUrl = URL.createObjectURL(file); // Set preview URL

            // Mark form as dirty
                this.courseForm.markAsDirty();

            this.snackBar.open('Thumbnail selected successfully!', 'Close', {
                    duration: 2000,
                });
        }
    }

    // Method to clear thumbnail
    clearThumbnail(): void {
        // Clean up preview URL
        if (this.thumbnailPreviewUrl) {
            URL.revokeObjectURL(this.thumbnailPreviewUrl);
            this.thumbnailPreviewUrl = null;
        }
        
        // Clear file and form field
        this.thumbnailFile = null;
        this.courseForm.patchValue({ thumbnailImageUrl: '' });
        this.courseForm.markAsDirty();
        
        this.snackBar.open('Thumbnail removed', 'Close', { duration: 2000 });
    }

    // Get the current thumbnail URL (either preview or existing)
    getThumbnailUrl(): string {
        // Priority: preview URL (newly selected) > existing thumbnailImageUrl > placeholder
        return this.thumbnailPreviewUrl || 
               this.courseForm.get('thumbnailImageUrl')?.value || 
               'https://placehold.co/300x200?text=Upload+Thumbnail';
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
            categoryId: course.categoryId,
            thumbnailImageUrl: course.thumbnailImageUrl || '',
            isPublished: course.isPublished || false,
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
                    isUploadingVideo: [false], // Added for video upload status
                    videoFile: [null], // For storing new video files
                    videoPreviewUrl: [''], // For storing preview URLs
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
        return this.curriculumArray.controls
            .map(section => this.getLessonsArray(this.curriculumArray.controls.indexOf(section)).length)
            .reduce((total, sectionLessons) => total + sectionLessons, 0);
    }

    getTotalDuration(): number {
        let totalDuration = 0;
        this.curriculumArray.controls.forEach((section, sectionIndex) => {
            this.getLessonsArray(sectionIndex).controls.forEach(lesson => {
                    const duration = lesson.get('duration')?.value || 0;
                totalDuration += parseInt(duration);
            });
        });
        return totalDuration;
    }

    // Video upload methods
    onVideoFileSelected(event: any, sectionIndex: number, lessonIndex: number): void {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('video/')) {
            this.snackBar.open('Please select a valid video file.', 'Close', {
                duration: 3000,
            });
            return;
        }

        // Validate file size (max 500MB)
        const maxSize = 500 * 1024 * 1024; // 500MB in bytes
        if (file.size > maxSize) {
            this.snackBar.open('Video file size must be less than 500MB.', 'Close', {
                duration: 3000,
            });
            return;
        }

        // Store video file temporarily in the lesson form
        const lessonForm = this.getLessonFormGroup(sectionIndex, lessonIndex);
        
        // Create a temporary preview URL
        const previewUrl = URL.createObjectURL(file);
        
        // Store the file and preview URL in the form
        lessonForm.patchValue({ 
            videoFile: file,  // Store the actual file
            videoUrl: `📁 ${file.name} (${this.formatFileSize(file.size)})`, // Show filename as placeholder
            videoPreviewUrl: previewUrl // For potential preview functionality
        });
        
        lessonForm.markAsDirty();
        
        this.snackBar.open(`Video "${file.name}" selected successfully!`, 'Close', {
            duration: 3000,
        });
    }

    public formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Update the uploadVideoForLesson to handle the actual upload during course creation
    private uploadVideoForLesson(file: File, lectureId: number, sectionIndex: number, lessonIndex: number): Promise<string> {
        return new Promise((resolve, reject) => {
            const lessonForm = this.getLessonFormGroup(sectionIndex, lessonIndex);
            
            // Set loading state
            lessonForm.patchValue({ isUploadingVideo: true });

            this.courseService.uploadLessonVideo(lectureId, file).subscribe({
                next: (response) => {
                    // Update the lesson with the video URL and automatically extracted duration
                    lessonForm.patchValue({ 
                        videoUrl: response.videoUrl,
                        duration: response.durationInMinutes, // Automatically set duration from backend
                        isUploadingVideo: false 
                    });
                    
                    // Show success message with duration info
                    if (response.durationInMinutes > 0) {
                        this.snackBar.open(
                            `Video uploaded successfully! Duration: ${response.durationInMinutes} minutes`, 
                            'Close', 
                            { duration: 4000 }
                        );
                    } else {
                        this.snackBar.open(
                            'Video uploaded successfully!', 
                            'Close', 
                            { duration: 3000 }
                        );
                    }
                    
                    resolve(response.videoUrl);
                },
                error: (error) => {
                    console.error('Video upload failed:', error);
                    lessonForm.patchValue({ isUploadingVideo: false });
                    this.snackBar.open(
                        'Video upload failed. Please try again.', 
                        'Close', 
                        { duration: 5000 }
                    );
                    reject(error);
                }
            });
        });
    }

    isVideoUploading(sectionIndex: number, lessonIndex: number): boolean {
        return this.getLessonFormGroup(sectionIndex, lessonIndex).get('isUploadingVideo')?.value || false;
    }

    hasVideoFile(sectionIndex: number, lessonIndex: number): boolean {
        const videoFile = this.getLessonFormGroup(sectionIndex, lessonIndex).get('videoFile')?.value;
        return !!videoFile;
    }

    hasVideoUrl(sectionIndex: number, lessonIndex: number): boolean {
        const videoUrl = this.getLessonFormGroup(sectionIndex, lessonIndex).get('videoUrl')?.value;
        return !!videoUrl && videoUrl.trim() !== '' && !videoUrl.startsWith('📁');
    }

    dropSection(event: CdkDragDrop<string[]>): void {
        if (event.previousIndex !== event.currentIndex) {
            const section = this.curriculumArray.at(event.previousIndex);
            this.curriculumArray.removeAt(event.previousIndex);
            this.curriculumArray.insert(event.currentIndex, section);
        }
    }

    // Helper methods for video management
    clearVideoFile(sectionIndex: number, lessonIndex: number): void {
        const lessonForm = this.getLessonFormGroup(sectionIndex, lessonIndex);
        const previewUrl = lessonForm.get('videoPreviewUrl')?.value;
        
        // Clean up the object URL to prevent memory leaks
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        
        lessonForm.patchValue({
            videoFile: null,
            videoUrl: '',
            videoPreviewUrl: ''
        });
        
        lessonForm.markAsDirty();
        
        this.snackBar.open('Video file removed', 'Close', { duration: 2000 });
    }

    private loadCategories(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.categoryService.getCategories().subscribe({
                next: (categories) => {
                    this.categories = categories;
                    resolve();
                },
                error: (error) => {
                    console.error('Error loading categories:', error);
                    this.snackBar.open('Failed to load categories. Please try again.', 'Close', {
                        duration: 5000,
                    });
                    reject(error);
                },
            });
        });
    }
}
